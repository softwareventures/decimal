import {Comparator, Comparison} from "@softwareventures/ordered";

class StrictDecimal {
    constructor(public readonly units: number, public readonly billionths: number) {
        Object.freeze(this);
    }

    public toString(): string {
        if (this.billionths === 0) {
            return "" + this.units;
        } else if (this.units < 0 || this.billionths < 0) {
            return "-" + (-this.units) + "."
                + ("00000000" + (-this.billionths))
                    .substr(-9)
                    .replace(/0*$/, "");
        } else {
            return "" + this.units + "."
                + ("00000000" + this.billionths)
                    .substr(-9)
                    .replace(/0*$/, "");
        }
    }
}

export interface Decimal {
    readonly units: number;
    readonly billionths: number;

    toString(): string;
}

export type DecimalLike = number | { units?: number, billionths?: number };

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

export function subtract(a: DecimalLike, b: DecimalLike): Decimal {
    return add(a, negate(b));
}

export function multiply(a: DecimalLike, b: DecimalLike): Decimal {
    const an = normalize(a);
    const bn = normalize(b);
    return normalize({
        units: an.units * bn.units,
        billionths: an.units * bn.billionths + an.billionths * bn.units + an.billionths * bn.billionths * 1e-9
    });
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
    return compare(a, b) < 0;
}

export function lessThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    return compare(a, b) <= 0;
}

export function greaterThan(a: DecimalLike, b: DecimalLike): boolean {
    return compare(a, b) > 0;
}

export function greaterThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    return compare(a, b) >= 0;
}

export function equal(a: DecimalLike, b: DecimalLike): boolean {
    return compare(a, b) === 0;
}

export function notEqual(a: DecimalLike, b: DecimalLike): boolean {
    return compare(a, b) !== 0;
}