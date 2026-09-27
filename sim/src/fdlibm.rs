//! V8's `Math.log` and `Math.tanh`: fdlibm as ported in V8's
//! src/base/ieee754.cc, operation for operation. The platform's libm can
//! differ in the last bit, which could flip a search comparison.

fn high(x: f64) -> i32 {
    (x.to_bits() >> 32) as u32 as i32
}
fn low(x: f64) -> u32 {
    x.to_bits() as u32
}
fn with_high(x: f64, hi: i32) -> f64 {
    f64::from_bits((u64::from(hi as u32) << 32) | u64::from(low(x)))
}
fn from_words(hi: u32, lo: u32) -> f64 {
    f64::from_bits((u64::from(hi) << 32) | u64::from(lo))
}

pub fn log(mut x: f64) -> f64 {
    const LN2_HI: f64 = 6.93147180369123816490e-01;
    const LN2_LO: f64 = 1.90821492927058770002e-10;
    const TWO54: f64 = 1.80143985094819840000e+16;
    const LG1: f64 = 6.666666666666735130e-01;
    const LG2: f64 = 3.999999999940941908e-01;
    const LG3: f64 = 2.857142874366239149e-01;
    const LG4: f64 = 2.222219843214978396e-01;
    const LG5: f64 = 1.818357216161805012e-01;
    const LG6: f64 = 1.531383769920937332e-01;
    const LG7: f64 = 1.479819860511658591e-01;
    let mut hx = high(x);
    let lx = low(x);
    let mut k: i32 = 0;
    if hx < 0x00100000 {
        if ((hx & 0x7fffffff) as u32 | lx) == 0 {
            return f64::NEG_INFINITY;
        }
        if hx < 0 {
            return f64::NAN;
        }
        k -= 54;
        x *= TWO54;
        hx = high(x);
    }
    if hx >= 0x7ff00000 {
        return x + x;
    }
    k += (hx >> 20) - 1023;
    hx &= 0x000fffff;
    let i = (hx + 0x95f64) & 0x100000;
    x = with_high(x, hx | (i ^ 0x3ff00000));
    k += i >> 20;
    let f = x - 1.0;
    if (0x000fffff & (2 + hx)) < 3 {
        if f == 0.0 {
            if k == 0 {
                return 0.0;
            }
            let dk = f64::from(k);
            return dk * LN2_HI + dk * LN2_LO;
        }
        let r = f * f * (0.5 - 0.33333333333333333 * f);
        if k == 0 {
            return f - r;
        }
        let dk = f64::from(k);
        return dk * LN2_HI - ((r - dk * LN2_LO) - f);
    }
    let s = f / (2.0 + f);
    let dk = f64::from(k);
    let z = s * s;
    let mut i = hx - 0x6147a;
    let w = z * z;
    let j = 0x6b851 - hx;
    let t1 = w * (LG2 + w * (LG4 + w * LG6));
    let t2 = z * (LG1 + w * (LG3 + w * (LG5 + w * LG7)));
    i |= j;
    let r = t2 + t1;
    if i > 0 {
        let hfsq = 0.5 * f * f;
        if k == 0 {
            f - (hfsq - s * (hfsq + r))
        } else {
            dk * LN2_HI - ((hfsq - (s * (hfsq + r) + dk * LN2_LO)) - f)
        }
    } else if k == 0 {
        f - s * (f - r)
    } else {
        dk * LN2_HI - ((s * (f - r) - dk * LN2_LO) - f)
    }
}

pub fn expm1(mut x: f64) -> f64 {
    const TINY: f64 = 1.0e-300;
    const HUGE: f64 = 1.0e+300;
    const O_THRESHOLD: f64 = 7.09782712893383973096e+02;
    const LN2_HI: f64 = 6.93147180369123816490e-01;
    const LN2_LO: f64 = 1.90821492927058770002e-10;
    const INVLN2: f64 = 1.44269504088896338700e+00;
    const Q1: f64 = -3.33333333333331316428e-02;
    const Q2: f64 = 1.58730158725481460165e-03;
    const Q3: f64 = -7.93650757867487942473e-05;
    const Q4: f64 = 4.00821782732936239552e-06;
    const Q5: f64 = -2.01099218183624371326e-07;
    let mut hx = high(x) as u32;
    let xsb = hx & 0x80000000;
    hx &= 0x7fffffff;
    if hx >= 0x4043687a {
        if hx >= 0x40862e42 {
            if hx >= 0x7ff00000 {
                if ((hx & 0xfffff) | low(x)) != 0 {
                    return x + x;
                }
                return if xsb == 0 { x } else { -1.0 };
            }
            if x > O_THRESHOLD {
                return f64::INFINITY;
            }
        }
        if xsb != 0 && x + TINY < 0.0 {
            return TINY - 1.0;
        }
    }
    let k: i32;
    let mut c = 0.0;
    if hx > 0x3fd62e42 {
        let (hi, lo);
        if hx < 0x3ff0a2b2 {
            if xsb == 0 {
                hi = x - LN2_HI;
                lo = LN2_LO;
                k = 1;
            } else {
                hi = x + LN2_HI;
                lo = -LN2_LO;
                k = -1;
            }
        } else {
            k = (INVLN2 * x + if xsb == 0 { 0.5 } else { -0.5 }) as i32;
            let t = f64::from(k);
            hi = x - t * LN2_HI;
            lo = t * LN2_LO;
        }
        x = hi - lo;
        c = (hi - x) - lo;
    } else if hx < 0x3c900000 {
        let t = HUGE + x;
        return x - (t - (HUGE + x));
    } else {
        k = 0;
    }
    let hfx = 0.5 * x;
    let hxs = x * hfx;
    let r1 = 1.0 + hxs * (Q1 + hxs * (Q2 + hxs * (Q3 + hxs * (Q4 + hxs * Q5))));
    let t = 3.0 - r1 * hfx;
    let mut e = hxs * ((r1 - t) / (6.0 - x * t));
    if k == 0 {
        return x - (x * e - hxs);
    }
    let twopk = from_words((0x3ff00000i32 + (k << 20)) as u32, 0);
    e = x * (e - c) - c;
    e -= hxs;
    if k == -1 {
        return 0.5 * (x - e) - 0.5;
    }
    if k == 1 {
        return if x < -0.25 { -2.0 * (e - (x + 0.5)) } else { 1.0 + 2.0 * (x - e) };
    }
    if k <= -2 || k > 56 {
        let mut y = 1.0 - (e - x);
        if k == 1024 {
            y = y * 2.0 * 8.98846567431158e+307;
        } else {
            y *= twopk;
        }
        return y - 1.0;
    }
    let y;
    if k < 20 {
        let t = with_high(1.0, 0x3ff00000 - (0x200000 >> k));
        y = (t - (e - x)) * twopk;
    } else {
        let t = with_high(1.0, (0x3ff - k) << 20);
        y = ((x - (e + t)) + 1.0) * twopk;
    }
    y
}

/// The fingerprint `mathFingerprint` in tools/sim/export-data.cjs computes
/// from V8: FNV-1a over the result bytes, as (log, tanh).
pub fn fingerprint(samples: u32, seed: u32) -> (u32, u32) {
    fn add(mut h: u32, value: f64) -> u32 {
        for b in value.to_bits().to_le_bytes() {
            h = (h ^ u32::from(b)).wrapping_mul(16_777_619);
        }
        h
    }
    let mut rng = crate::rng::Rng::new(seed);
    let (mut lh, mut th) = (2_166_136_261u32, 2_166_136_261u32);
    for i in 0..samples {
        let (a, b) = (rng.next(), rng.next());
        let t = match i % 3 {
            0 => (a - 0.5) * 60.0,
            1 => (a - 0.5) / (1.0 + (b * 1e6).floor()),
            _ => (a - 0.5) / (1.0 + (b * 1e12).floor()),
        };
        let l = match i % 5 {
            0 => 2.0 + (a * 1e5).floor(),
            1 => (a + 1e-9) * 4.0,
            2 => 1.0 + (a - 0.5) / (1.0 + (b * 1e8).floor()),
            3 => (a + 1e-9) * 1e-310,
            _ => (a + 1e-9) * 1e300,
        };
        th = add(th, tanh(t));
        lh = add(lh, log(l));
    }
    (lh, th)
}

pub fn tanh(x: f64) -> f64 {
    const TINY: f64 = 1.0e-300;
    const HUGE: f64 = 1.0e300;
    let jx = high(x);
    let ix = jx & 0x7fffffff;
    if ix >= 0x7ff00000 {
        return if jx >= 0 { 1.0 / x + 1.0 } else { 1.0 / x - 1.0 };
    }
    let z;
    if ix < 0x40360000 {
        if ix < 0x3e300000 && HUGE + x > 1.0 {
            return x;
        }
        if ix >= 0x3ff00000 {
            let t = expm1(2.0 * x.abs());
            z = 1.0 - 2.0 / (t + 2.0);
        } else {
            let t = expm1(-2.0 * x.abs());
            z = -t / (t + 2.0);
        }
    } else {
        z = 1.0 - TINY;
    }
    if jx >= 0 {
        z
    } else {
        -z
    }
}
