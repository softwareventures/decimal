import {Comparator, Comparison} from "@softwareventures/ordered";
import imul = require("imul");
import sign = require("math-sign");

class StrictDecimal {
    constructor(public readonly units: number, public readonly billionths: number) {
        Object.freeze(this);
    }

    public toString(): string {
        return "Decimal " + format(this);
    }
}

export interface Decimal {
    readonly units: number;
    readonly billionths: number;
}

export type DecimalLike = number | Partial<Decimal>;

export function normalize(value: DecimalLike): Decimal {
    if (value instanceof StrictDecimal) {
        return value;
    } else {
        if (typeof value === "number") {
            value = {units: value};
        }

        let units = value.units == null
            ? 0
            : Math.floor(value.units);

        let billionths: number;

        if (isFinite(units)) {
            billionths = value.units == null
                ? 0
                : Math.round((value.units - units) * 1e9);

            if (value.billionths != null) {
                billionths += Math.round(value.billionths);
            }

            if (isFinite(billionths)) {
                if (billionths >= 1e9) {
                    units += Math.floor(billionths / 1e9);
                    billionths -= Math.floor(billionths / 1e9) * 1e9;
                } else if (billionths <= -1e9) {
                    units += Math.ceil(billionths / 1e9);
                    billionths -= Math.ceil(billionths / 1e9) * 1e9;
                }

                if (units > 0 && billionths < 0) {
                    units -= 1;
                    billionths += 1e9;
                } else if (units < 0 && billionths > 0) {
                    units += 1;
                    billionths -= 1e9;
                }
            } else {
                units = billionths;
            }
        } else {
            billionths = units;
        }

        return new StrictDecimal(units | 0, billionths | 0);
    }
}

export const zero: Decimal = new StrictDecimal(0, 0);

export const epsilon: Decimal = new StrictDecimal(0, 1);

export function isInteger(value: DecimalLike): boolean {
    const {billionths} = normalize(value);
    return billionths === 0;
}

export function format(value: DecimalLike): string {
    const {units, billionths} = normalize(value);

    if (billionths === 0) {
        return "" + units;
    } else if (units < 0 || billionths < 0) {
        return "-" + (-units) + "."
            + ("00000000" + (-billionths))
                .substr(-9)
                .replace(/0*$/, "");
    } else {
        return "" + units + "."
            + ("00000000" + billionths)
                .substr(-9)
                .replace(/0*$/, "");
    }
}

export function formatFixed(value: DecimalLike, fractionDigits = 0): string {
    const n = normalize(value);
    fractionDigits = Math.max(Math.min(fractionDigits, 9), 0) | 0;

    if (fractionDigits === 0) {
        const carry = Number(n.billionths >= 500000000)
            || -Number(n.billionths < -500000000);
        return ((n.units + carry) | 0).toFixed(0);
    } else {
        const divisor = Math.pow(10, 9 - fractionDigits);
        const carryPoint = 0.5 * divisor;
        const modulo = n.billionths % divisor;
        const carry = (divisor * (Number(modulo >= carryPoint) || -Number(modulo < -carryPoint))) | 0;
        const {units, billionths} = add(n, {billionths: carry});

        if (units < 0 || billionths < 0) {
            return "-" + (-units) + "."
                + ("00000000" + (-billionths)).substr(-9, fractionDigits);
        } else {
            return "" + units + "."
                + ("00000000" + billionths).substr(-9, fractionDigits);
        }
    }
}

export function formatFixedFn(fractionDigits = 0): (value: DecimalLike) => string {
    return value => formatFixed(value, fractionDigits);
}

export function negate(value: DecimalLike): Decimal {
    const {units, billionths} = normalize(value);
    return new StrictDecimal(-units | 0, -billionths | 0);
}

export function add(a: DecimalLike, b: DecimalLike): Decimal {
    const an = normalize(a);
    const bn = normalize(b);
    return normalize({
        units: an.units + bn.units,
        billionths: an.billionths + bn.billionths
    });
}

export function addFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => add(a, b);
}

export function subtract(a: DecimalLike, b: DecimalLike): Decimal {
    return add(a, negate(b));
}

export function subtractFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => subtract(a, b);
}

export function subtractFrom(a: DecimalLike): (b: DecimalLike) => Decimal {
    return b => subtract(a, b);
}

export function multiply(a: DecimalLike, b: DecimalLike): Decimal {
    const an = normalize(a);
    const bn = normalize(b);

    const as = sign(an.units) || sign(an.billionths);
    const a1 = (imul(as, an.units) >> 16) & 0xffff;
    const a2 = imul(as, an.units) & 0xffff;
    const a3 = (imul(as, an.billionths) >> 16) & 0xffff;
    const a4 = imul(as, an.billionths) & 0xffff;
    const bs = sign(bn.units) || sign(bn.billionths);
    const b1 = (imul(bs, bn.units) >> 16) & 0xffff;
    const b2 = imul(bs, bn.units) & 0xffff;
    const b3 = (imul(bs, bn.billionths) >> 16) & 0xffff;
    const b4 = imul(bs, bn.billionths) & 0xffff;

    const s = imul(as, bs);

    const billionths = imul(s, ((((((((((a1 * b3 * 4294967296) % 1e9
        + a1 * b4 * 65536) % 1e9
        + a2 * b3 * 65536) % 1e9
        + a2 * b4) % 1e9
        + a3 * b1 * 4294967296) % 1e9
        + a3 * b2 * 65536) % 1e9
        + a4 * b1 * 65536) % 1e9
        + a4 * b2) % 1e9
        + Math.round((((a3 * b3 * 4.294967296
            + a3 * b4 * 6.5536e-5) % 1e9
            + a4 * b3 * 6.5536e-5) % 1e9
            + a4 * b4 * 1e-9) % 1e9)) % 1e9));

    const units = imul(s, (((((((((((((((((((((a1 * b2 * 65536) | 0)
        + ((a1 * b3 * 4.294967296) | 0)) | 0)
        + ((a1 * b4 * 6.5536e-5) | 0)) | 0)
        + ((a2 * b1 * 65536) | 0)) | 0)
        + imul(a2, b2)) | 0)
        + ((a2 * b3 * 6.5536e-5) | 0)) | 0)
        + ((a2 * b4 * 1e-9) | 0)) | 0)
        + ((a3 * b1 * 4.294967296) | 0)) | 0)
        + ((a3 * b2 * 6.5536e-5) | 0)) | 0)
        + ((a4 * b1 * 6.5536e-5) | 0)) | 0)
        + ((a4 * b2 * 1e-9) | 0)));

    return new StrictDecimal(units, billionths);
}

export function multiplyFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => multiply(a, b);
}

export const compare: Comparator<DecimalLike> = (a, b) => {
    const an = normalize(a);
    const bn = normalize(b);

    if (an.units < bn.units) {
        return Comparison.before;
    } else if (an.units > bn.units) {
        return Comparison.after;
    } else if (an.billionths < bn.billionths) {
        return Comparison.before;
    } else if (an.billionths > bn.billionths) {
        return Comparison.after;
    } else if (an.billionths === bn.billionths) {
        return Comparison.equal;
    } else {
        return Comparison.undefined;
    }
};

export function lessThan(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units < bn.units || (an.units === bn.units && an.billionths < bn.billionths);
}

export function lessThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => lessThan(a, b);
}

export function lessThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units < bn.units || (an.units === bn.units && an.billionths <= bn.billionths);
}

export function lessThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => lessThanOrEqual(a, b);
}

export function greaterThan(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units > bn.units || (an.units === bn.units && an.billionths > bn.billionths);
}

export function greaterThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => greaterThan(a, b);
}

export function greaterThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units > bn.units || (an.units === bn.units && an.billionths >= bn.billionths);
}

export function greaterThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => greaterThanOrEqual(a, b);
}

export function equal(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units === bn.units && an.billionths === bn.billionths;
}

export function equalFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => equal(a, b);
}

export function notEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = normalize(a);
    const bn = normalize(b);

    return an.units !== bn.units || an.billionths !== bn.billionths;
}

export function notEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => notEqual(a, b);
}