export default interface Decimal {
    units: number;
    billionths: number;

    toString(): string;
}