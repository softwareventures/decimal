import {Comparator, Comparison} from "@softwareventures/ordered";
import imul = require("imul");

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
    const aThousandths = toThousandths(a);
    const bThousandths = toThousandths(b);

    const matrix = aThousandths
        .map(an => bThousandths.map(bn => imul(an, bn)));

    const cThousandths = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let carry = 0;
    for (let i = 8; i >= 0; --i) {
        let sum = carry;
        for (let j = Math.max(i - 3, 0); j < 6 && j < i + 3; ++j) {
            const k = i - j + 2;
            sum = iadd(sum, matrix[j][k]);
        }
        cThousandths[i] = imod(sum, 1e3);
        carry = idiv(sum, 1e3);
        if (i === 6) {
            if (cThousandths[6] >= 500) {
                carry = iadd(carry, 1);
            } else if (cThousandths[6] < -500) {
                carry = iadd(carry, -1);
            }
        }
    }

    return fromThousandths(cThousandths.slice(0, 6) as Thousandths);
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

type Thousandths = [number, number, number, number, number, number];

/** @internal */
export function toThousandths(decimal: DecimalLike): Thousandths {
    const {units, billionths} = normalize(decimal);
    return [idiv(units, 1e6), imod(idiv(units, 1e3), 1e3), imod(units, 1e3),
        idiv(billionths, 1e6), imod(idiv(billionths, 1e3), 1e3), imod(billionths, 1e3)];
}

/** @internal */
export function fromThousandths(thousandths: Thousandths): Decimal {
    const [a, b, c, d, e, f] = thousandths;
    const units = isum(imul(a, 1e6), imul(b, 1e3), c);
    const billionths = isum(imul(d, 1e6), imul(e, 1e3), f);
    return new StrictDecimal(units, billionths);
}

function iadd(a: number, b: number): number {
    return (a + b) | 0;
}

function isum(...values: number[]): number {
    let sum = 0;
    for (let i = 0; i < values.length; ++i) {
        sum = (sum + values[i]) | 0;
    }
    return sum;
}

function idiv(a: number, b: number): number {
    return ((a | 0) / (b | 0)) | 0;
}

function imod(a: number, b: number): number {
    return ((a | 0) % (b | 0)) | 0;
}