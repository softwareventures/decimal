export default interface Decimal {
    units: number;
    billionths: number;

    toString(): string;
}

function toString(this: Partial<Readonly<Decimal>>): string {
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

export function normalize(value: Partial<Readonly<Decimal>>): Decimal {
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

    return {units, billionths, toString};
}