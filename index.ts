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

    const as = sign(an.units) || sign(an.billionths);       // -1 | 1
    const a1 = (imul(as, an.units) >>> 16) & 0xffff;        // max 2^16 - 1
    const a2 = imul(as, an.units) & 0xffff;                 // max 2^16 - 1
    const a3 = imul(as, an.billionths) >>> 16;              // max 15258
    const a4 = imul(as, an.billionths) & 0xffff;            // max 2^16 - 1
    const bs = sign(bn.units) || sign(bn.billionths);       // -1 | 1
    const b1 = (imul(bs, bn.units) >>> 16) & 0xffff;        // max 2^16 - 1
    const b2 = imul(bs, bn.units) & 0xffff;                 // max 2^16 - 1
    const b3 = (imul(bs, bn.billionths) >>> 16) & 0xffff;   // max 15258
    const b4 = imul(bs, bn.billionths) & 0xffff;            // max 2^16 - 1

    /* tslint:disable:max-line-length */
    const s = imul(as, bs);          // -1 | 1
    const a1b2 = imul(a1, b2) >>> 0; // max 2^32 - 131071    // a1b2 << 16 -> units
    const a1b3 = imul(a1, b3) >>> 0; // max 2^30 - 73808794  // (a1b3 << 32) / 1e9 -> units   // a1b3 << 32 -> billionths
    const a1b4 = imul(a1, b4) >>> 0; // max 2^32 - 131071    // (a1b4 << 16) / 1e9 -> units   // a1b4 << 16 -> billionths
    const a2b1 = imul(a2, b1) >>> 0; // max 2^32 - 131071    // a2b1 << 16 -> units
    const a2b2 = imul(a2, b2) >>> 0; // max 2^32 - 131071    // a2b2 -> units
    const a2b3 = imul(a2, b3) >>> 0; // max 2^30 - 73808794  // (a2b3 << 16) / 1e9 -> units   // a2b3 << 16 -> billionths
    const a2b4 = imul(a2, b4) >>> 0; // max 2^32 - 131071    // a2b4 / 1e9 -> units           // a2b4 -> billionths
    const a3b1 = imul(a3, b1) >>> 0; // max 2^30 - 73808794  // (a3b1 << 32) / 1e9 -> units   // a3b1 << 32 -> billionths
    const a3b2 = imul(a3, b2) >>> 0; // max 2^30 - 73808794  // (a3b2 << 16) / 1e9 -> units   // a3b2 << 16 -> billionths
    const a3b3 = imul(a3, b3) >>> 0; // max 2^28 - 35628892                                   // (a3b3 << 32) / 1e9 -> billionths
    const a3b4 = imul(a3, b4) >>> 0; // max 2^30 - 73808794                                   // (a3b4 << 16) / 1e9 -> billionths
    const a4b1 = imul(a4, b1) >>> 0; // max 2^32 - 131071    // (a4b1 << 16) / 1e9 -> units   // a4b1 << 16 -> billionths
    const a4b2 = imul(a4, b2) >>> 0; // max 2^32 - 131071    // a4b2 / 1e9 -> units           // a4b2 -> billionths
    const a4b3 = imul(a4, b3) >>> 0; // max 2^30 - 73808794                                   // (a4b3 << 16) / 1e9 -> billionths
    const a4b4 = imul(a4, b4) >>> 0; // max 2^32 - 131071                                     // a4b4 / 1e9 -> billionths
    /* tslint:enable:max-line-length */

    function usum(...values: number[]): number {
        let sum = 0;
        for (let i = 0; i < values.length; ++i) {
            sum = (sum + values[i]) >>> 0;
        }
        return sum;
    }

    function u16sum(...values: number[]): number {
        let sum = 0;
        for (let i = 0; i < values.length; ++i) {
            sum = (sum + values[i]) & 0xffff;
        }
        return sum;
    }

    function usummod1e9carry(...values: number[]): { sum: number, carry: number } {
        let sum = 0;
        let carry = 0;
        for (let i = 0; i < values.length; ++i) {
            const value = values[i] >>> 0;
            const valueCarry = (value / 1e9) >>> 0;
            const valueMod = (value - imul(valueCarry, 1e9)) >>> 0;
            sum = (sum + valueMod) >>> 0;
            const sumCarry = (sum / 1e9) >>> 0;
            sum -= imul(sumCarry, 1e9);
            carry += valueCarry + sumCarry;
        }
        return {sum, carry};
    }

    function ushl16(value: number): number {
        return (value << 16) >>> 0;
    }

    function ushl48div1e9(value: number): number {
        return ((value >>> 0) * 281474.976710656) >>> 0;
    }

    function ushl32div1e9(value: number): number {
        return ((value >>> 0) * 4.294967296) >>> 0;
    }

    function ushl16div1e9(value: number): number {
        return ((value >>> 0) * 0.000065536) >>> 0;
    }

    function udiv1e9(value: number): number {
        return ((value >>> 0) / 1e9) >>> 0;
    }

    function ushl16mod1e9(value: number): number {
        const d = ushl16div1e9(value);
        return ((value << 16) - (d * 1e9)) >>> 0;
    }

    function ushl32mod1e9(value: number): number {
        const d = ushl32div1e9(value);
        return (-d * 1e9) >>> 0;
    }

    const subBillionths = u16sum(
        ushl48div1e9(a3b3),
        ushl32div1e9(a3b4),
        ushl32div1e9(a4b3));

    const rounding = s > 0
        ? subBillionths > 0x7fff
            ? 1
            : 0
        : subBillionths > 0x8000
            ? 1
            : 0;

    const {sum: billionths, carry: carry} = usummod1e9carry(
        ushl32mod1e9(a1b3),
        ushl16mod1e9(a1b4),
        ushl16mod1e9(a2b3),
        a2b4,
        ushl32mod1e9(a3b1),
        ushl16mod1e9(a3b2),
        ushl32div1e9(a3b3),
        ushl16div1e9(a3b4),
        ushl16mod1e9(a4b1),
        a4b2,
        ushl16div1e9(a4b3),
        udiv1e9(a4b4),
        rounding);

    const units = usum(
        ushl16(a1b2),
        ushl32div1e9(a1b3),
        ushl16div1e9(a1b4),
        ushl16(a2b1),
        a2b2,
        ushl16div1e9(a2b3),
        udiv1e9(a2b4),
        ushl32div1e9(a3b1),
        ushl16div1e9(a3b2),
        ushl16div1e9(a4b1),
        udiv1e9(a4b2),
        carry);

    return new StrictDecimal(imul(s, units), imul(s, billionths));
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

export function abs(value: DecimalLike): Decimal {
    const {units, billionths} = normalize(value);
    return new StrictDecimal(Math.abs(units), Math.abs(billionths));
}

export function trunc(value: DecimalLike): Decimal {
    const {units} = normalize(value);
    return new StrictDecimal(units, 0);
}

export function floor(value: DecimalLike): Decimal {
    const n = normalize(value);
    if (n.billionths === 0) {
        return n;
    } else if (n.billionths > 0) {
        return new StrictDecimal(n.units, 0);
    } else {
        return new StrictDecimal((n.units - 1) | 0, 0);
    }
}

export function ceil(value: DecimalLike): Decimal {
    const n = normalize(value);
    if (n.billionths === 0) {
        return n;
    } else if (n.billionths > 0) {
        return new StrictDecimal((n.units + 1) | 0, 0);
    } else {
        return new StrictDecimal(n.units, 0);
    }
}

export function round(value: DecimalLike): Decimal {
    const n = normalize(value);
    if (n.billionths >= 500000000) {
        return new StrictDecimal((n.units + 1) | 0, 0);
    } else if (n.billionths < -500000000) {
        return new StrictDecimal((n.units - 1) | 0, 0);
    } else {
        return new StrictDecimal(n.units, 0);
    }
}

export function max(a: DecimalLike, b: DecimalLike): Decimal {
    const an = normalize(a);
    const bn = normalize(b);
    return lessThan(an, bn)
        ? bn
        : an;
}

export function maxFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => max(a, b);
}

export function min(a: DecimalLike, b: DecimalLike): Decimal {
    const an = normalize(a);
    const bn = normalize(b);
    return lessThanOrEqual(an, bn)
        ? an
        : bn;
}

export function minFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => min(a, b);
}