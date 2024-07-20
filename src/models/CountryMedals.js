class CountryMedals {
    /**
     * Represents the medal count for a country.
     *
     * @class
     * @param {string} country - The name of the country.
     * @param {string} countryCode - The code of the country.
     * @param {number} total - The total number of medals.
     * @param {number} gold - The number of gold medals.
     * @param {number} silver - The number of silver medals.
     * @param {number} bronze - The number of bronze medals.
     */
    constructor(country, countryCode, total, gold, silver, bronze) {
        this.country = country;
        this.countryCode = countryCode;
        this.total = total;
        this.gold = gold;
        this.silver = silver;
        this.bronze = bronze;
    }
}

module.exports = CountryMedals;