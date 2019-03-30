import {Comparator, Comparison} from "@softwareventures/ordered";

export default interface Decimal {
    units: number;
    billionths: number;

    toString(): string;
}

export type DecimalLike = Partial<Readonly<Decimal>> | number;

function toString(this: DecimalLike): string {
    const {units, billionths} = normalize(this);
    if (!isFinite(units) || Math.abs(billionths) < 0.5 || units >= 1e21) {
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

export function normalize(value: DecimalLike): Decimal {
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

    return {
        units: units | 0,
        billionths: billionths | 0,
        toString
    };
}

export const zero = Object.freeze(normalize({}));

export function negate(value: DecimalLike): Decimal {
    const {units, billionths} = normalize(value);
    return {
        units: -units | 0,
        billionths: -billionths | 0,
        toString
    };
}

export function add(a: DecimalLike, b: DecimalLike): Decimal {
    if (typeof a === "number") {
        const {units, billionths} = normalize(b);
        return normalize({units: a + units, billionths});
    } else if (typeof b === "number") {
        const {units, billionths} = normalize(a);
        return normalize({units: units + b, billionths});
    } else {
        const an = normalize(a);
        const bn = normalize(b);
        return normalize({
            units: (an.units + bn.units) | 0,
            billionths: (an.billionths + bn.billionths) | 0
        });
    }
}

export function subtract(a: DecimalLike, b: DecimalLike): Decimal {
    return add(a, negate(b));
}

export function multiply(a: DecimalLike, b: DecimalLike): Decimal {
    if (typeof a === "number") {
        const {units, billionths} = normalize(b);
        return normalize({units: a * units, billionths: a * billionths});
    } else if (typeof b === "number") {
        const {units, billionths} = normalize(a);
        return normalize({units: units * b, billionths: billionths * b});
    } else {
        const an = normalize(a);
        const bn = normalize(b);
        return normalize({
            units: an.units * bn.units,
            billionths: an.units * bn.billionths + an.billionths * bn.units + an.billionths * bn.billionths * 1e-9
        });
    }
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