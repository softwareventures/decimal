import {Comparator, Comparison} from "@softwareventures/ordered";
import {i32, iadd, idiv, imod, imul, ineg, ipow, isub, isum} from "i32";

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

export function decimal(value: DecimalLike): Decimal {
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

        return new StrictDecimal(i32(units), i32(billionths));
    }
}

export function normalize(value: DecimalLike): Decimal {
    return decimal(value);
}

export function normalizeDecimal(value: DecimalLike): Decimal {
    return decimal(value);
}

export const zero: Decimal = new StrictDecimal(0, 0);
export const decimalZero = zero;

export const epsilon: Decimal = new StrictDecimal(0, 1);
export const decimalEpsilon = epsilon;

export function isInteger(value: DecimalLike): boolean {
    const {billionths} = decimal(value);
    return billionths === 0;
}

export function decimalIsInteger(value: DecimalLike): boolean {
    return isInteger(value);
}

export function parse(text: string): Decimal | null {
    const matches = /^([-+]?)(?:([0-9]{1,10})(?:\.([0-9]{0,9}))?|\.([0-9]{1,9}))$/.exec(text);

    if (matches == null) {
        return null;
    }

    const sign = matches[1];
    const units = parseInt(matches[2] ?? "0", 10);
    const billionths = parseInt(`${matches[3] ?? matches[4] ?? ""}000000000`.substr(0, 9), 10);

    if (units !== i32(units)) {
        return null;
    }

    return sign === "-"
        ? new StrictDecimal(ineg(units), ineg(billionths))
        : new StrictDecimal(i32(units), i32(billionths));
}

export function parseDecimal(text: string): Decimal | null {
    return parse(text);
}

export function format(value: DecimalLike): string {
    const {units, billionths} = decimal(value);

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

export function formatDecimal(value: DecimalLike): string {
    return format(value);
}

export function formatFixed(value: DecimalLike, fractionDigits = 0): string {
    const n = decimal(value);
    fractionDigits = i32(Math.max(Math.min(fractionDigits, 9), 0));

    if (fractionDigits === 0) {
        const carry = Number(n.billionths >= 500000000)
            || -Number(n.billionths < -500000000);
        return iadd(n.units, carry).toFixed(0);
    } else {
        const divisor = Math.pow(10, 9 - fractionDigits);
        const carryPoint = 0.5 * divisor;
        const modulo = n.billionths % divisor;
        const carry = imul(divisor, (Number(modulo >= carryPoint) || -Number(modulo < -carryPoint)));
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

export function formatDecimalFixed(value: DecimalLike, fractionDigits = 0): string {
    return formatFixed(value, fractionDigits);
}

export function formatDecimalFixedFn(fractionDigits = 0): (value: DecimalLike) => string {
    return formatFixedFn(fractionDigits);
}

export function sign(value: DecimalLike): -1 | 0 | 1 {
    const {units, billionths} = decimal(value);
    if (units === 0) {
        if (billionths === 0) {
            return 0;
        } else if (billionths < 0) {
            return -1;
        } else {
            return 1;
        }
    } else if (units < 0) {
        return -1;
    } else {
        return 1;
    }
}

export function decimalSign(value: DecimalLike): -1 | 0 | 1 {
    return sign(value);
}

export function negate(value: DecimalLike): Decimal {
    const {units, billionths} = decimal(value);
    return new StrictDecimal(ineg(units), ineg(billionths));
}

export function negateDecimal(value: DecimalLike): Decimal {
    return negate(value);
}

export function add(a: DecimalLike, b: DecimalLike): Decimal {
    const an = decimal(a);
    const bn = decimal(b);
    return decimal({
        units: an.units + bn.units,
        billionths: an.billionths + bn.billionths
    });
}

export function addFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => add(a, b);
}

export function addDecimal(a: DecimalLike, b: DecimalLike): Decimal {
    return add(a, b);
}

export function addDecimalFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return addFn(b);
}

export function subtract(a: DecimalLike, b: DecimalLike): Decimal {
    return add(a, negate(b));
}

export function subtractFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => subtract(a, b);
}

export function subtractDecimal(a: DecimalLike, b: DecimalLike): Decimal {
    return subtract(a, b);
}

export function subtractDecimalFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return subtractFn(b);
}

export function subtractFrom(a: DecimalLike): (b: DecimalLike) => Decimal {
    return b => subtract(a, b);
}

export function subtractDecimalFrom(a: DecimalLike): (b: DecimalLike) => Decimal {
    return subtractFrom(a);
}

export function multiply(a: DecimalLike, b: DecimalLike): Decimal {
    const aThousandths = toThousandths(a);
    const bThousandths = toThousandths(b);

    const cThousandths = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let carry = 0;
    for (let i = 8; i >= 0; --i) {
        let sum = carry;
        for (let j = Math.max(i - 3, 0); j < 6 && j < i + 3; ++j) {
            const k = i - j + 2;
            sum = iadd(sum, imul(aThousandths[j], bThousandths[k]));
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

export function multiplyDecimal(a: DecimalLike, b: DecimalLike): Decimal {
    return multiply(a, b);
}

export function multiplyDecimalFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return multiplyFn(b);
}

export const compare: Comparator<DecimalLike> = (a, b) => {
    const an = decimal(a);
    const bn = decimal(b);

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

export const compareDecimal = compare;

export function lessThan(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units < bn.units || (an.units === bn.units && an.billionths < bn.billionths);
}

export function lessThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => lessThan(a, b);
}

export function decimalLessThan(a: DecimalLike, b: DecimalLike): boolean {
    return lessThan(a, b);
}

export function decimalLessThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return lessThanFn(b);
}

export function lessThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units < bn.units || (an.units === bn.units && an.billionths <= bn.billionths);
}

export function lessThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => lessThanOrEqual(a, b);
}

export function decimalLessThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    return lessThanOrEqual(a, b);
}

export function decimalLessThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return lessThanOrEqualFn(b);
}

export function greaterThan(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units > bn.units || (an.units === bn.units && an.billionths > bn.billionths);
}

export function greaterThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => greaterThan(a, b);
}

export function decimalGreaterThan(a: DecimalLike, b: DecimalLike): boolean {
    return greaterThan(a, b);
}

export function decimalGreaterThanFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return greaterThanFn(b);
}

export function greaterThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units > bn.units || (an.units === bn.units && an.billionths >= bn.billionths);
}

export function greaterThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => greaterThanOrEqual(a, b);
}

export function decimalGreaterThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    return greaterThanOrEqual(a, b);
}

export function decimalGreaterThanOrEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return greaterThanOrEqualFn(b);
}

export function equal(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units === bn.units && an.billionths === bn.billionths;
}

export function equalFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => equal(a, b);
}

export function decimalEqual(a: DecimalLike, b: DecimalLike): boolean {
    return equal(a, b);
}

export function decimalEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return equalFn(b);
}

export function notEqual(a: DecimalLike, b: DecimalLike): boolean {
    const an = decimal(a);
    const bn = decimal(b);

    return an.units !== bn.units || an.billionths !== bn.billionths;
}

export function notEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return a => notEqual(a, b);
}

export function decimalNotEqual(a: DecimalLike, b: DecimalLike): boolean {
    return notEqual(a, b);
}

export function decimalNotEqualFn(b: DecimalLike): (a: DecimalLike) => boolean {
    return notEqualFn(b);
}

export function abs(value: DecimalLike): Decimal {
    const {units, billionths} = decimal(value);
    return new StrictDecimal(Math.abs(units), Math.abs(billionths));
}

export function decimalAbs(value: DecimalLike): Decimal {
    return abs(value);
}

export function trunc(value: DecimalLike): Decimal {
    const {units} = decimal(value);
    return new StrictDecimal(units, 0);
}

export function decimalTrunc(value: DecimalLike): Decimal {
    return trunc(value);
}

export function floor(value: DecimalLike, fractionDigits = 0): Decimal {
    fractionDigits = i32(Math.max(Math.min(fractionDigits, 9), 0));

    const n = decimal(value);

    if (fractionDigits >= 9 || n.billionths === 0) {
        return n;
    }

    if (fractionDigits <= 0) {
        if (n.billionths === 0) {
            return n;
        } else if (n.billionths > 0) {
            return new StrictDecimal(n.units, 0);
        } else {
            return new StrictDecimal(isub(n.units, 1), 0);
        }
    }

    const modulus = imul(10, ipow(10, 8 - fractionDigits));
    const modulo = imod(n.billionths, modulus);
    const truncated = isub(n.billionths, modulo);

    if (n.billionths < 0 && modulo !== 0) {
        return new StrictDecimal(n.units, isub(truncated, modulus));
    } else {
        return new StrictDecimal(n.units, truncated);
    }
}

export function floorFn(fractionDigits: number): (value: DecimalLike) => Decimal {
    return value => floor(value, fractionDigits);
}

export function decimalFloor(value: DecimalLike, fractionDigits = 0): Decimal {
    return floor(value, fractionDigits);
}

export function decimalFloorFn(fractionDigits: number): (value: DecimalLike) => Decimal {
    return floorFn(fractionDigits);
}

export function ceil(value: DecimalLike, fractionDigits = 0): Decimal {
    fractionDigits = i32(Math.max(Math.min(fractionDigits, 9), 0));

    const n = decimal(value);

    if (fractionDigits >= 9 || n.billionths === 0) {
        return n;
    }

    if (fractionDigits <= 0) {
        if (n.billionths === 0) {
            return n;
        } else if (n.billionths < 0) {
            return new StrictDecimal(n.units, 0);
        } else {
            return new StrictDecimal(iadd(n.units, 1), 0);
        }
    }

    const modulus = imul(10, ipow(10, 8 - fractionDigits));
    const modulo = imod(n.billionths, modulus);
    const truncated = isub(n.billionths, modulo);

    if (n.billionths < 0 && modulo !== 0) {
        return new StrictDecimal(n.units, truncated);
    } else {
        return new StrictDecimal(n.units, iadd(truncated, modulus));
    }
}

export function ceilFn(fractionDigits: number): (value: DecimalLike) => Decimal {
    return value => ceil(value, fractionDigits);
}

export function decimalCeil(value: DecimalLike, fractionDigits = 0): Decimal {
    return ceil(value, fractionDigits);
}

export function decimalCeilFn(fractionDigits: number): (value: DecimalLike) => Decimal {
    return ceilFn(fractionDigits);
}

export function round(value: DecimalLike, fractionDigits = 0): Decimal {
    fractionDigits = i32(Math.max(Math.min(fractionDigits, 9), 0));

    if (fractionDigits >= 9) {
        return decimal(value);
    }

    const {units, billionths} = decimal(value);

    if (fractionDigits <= 0) {
        if (billionths >= 500000000) {
            return new StrictDecimal(iadd(units, 1), 0);
        } else if (billionths < -500000000) {
            return new StrictDecimal(isub(units, 1), 0);
        } else {
            return new StrictDecimal(units, 0);
        }
    }

    const pivot = imul(5, ipow(10, 8 - fractionDigits));
    const modulus = imul(pivot, 2);
    const modulo = imod(billionths, modulus);
    const truncated = isub(billionths, modulo);

    if (modulo >= pivot) {
        return new StrictDecimal(units, iadd(truncated, modulus));
    } else if (modulo < -pivot) {
        return new StrictDecimal(units, isub(truncated, modulus));
    } else {
        return new StrictDecimal(units, truncated);
    }
}

export function roundFn(fractionDigits = 0): (value: DecimalLike) => Decimal {
    return value => round(value, fractionDigits);
}

export function decimalRound(value: Decimal, fractionDigits = 0): Decimal {
    return round(value, fractionDigits);
}

export function decimalRoundFn(fractionDigits = 0): (value: DecimalLike) => Decimal {
    return roundFn(fractionDigits);
}

export function max(a: DecimalLike, b: DecimalLike): Decimal {
    const an = decimal(a);
    const bn = decimal(b);
    return lessThan(an, bn)
        ? bn
        : an;
}

export function maxFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => max(a, b);
}

export function maxDecimal(a: DecimalLike, b: DecimalLike): Decimal {
    return max(a, b);
}

export function maxDecimalFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return maxFn(b);
}

export function min(a: DecimalLike, b: DecimalLike): Decimal {
    const an = decimal(a);
    const bn = decimal(b);
    return lessThanOrEqual(an, bn)
        ? an
        : bn;
}

export function minFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return a => min(a, b);
}

export function minDecimal(a: DecimalLike, b: DecimalLike): Decimal {
    return min(a, b);
}

export function minDecimalFn(b: DecimalLike): (a: DecimalLike) => Decimal {
    return minFn(b);
}

type Thousandths = [number, number, number, number, number, number];

/** @internal */
export function toThousandths(value: DecimalLike): Thousandths {
    const {units, billionths} = decimal(value);
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
