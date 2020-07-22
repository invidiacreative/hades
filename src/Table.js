import { ValidationError } from "./errors";

/**
 * Table constants.
 */
const TABLE_NAME_BASE = "table_";

/**
 * Symbol constants.
 */
const SYMBOL_DESCRIPTION_KEY = "key";
const SYMBOL_DESCRIPTION_META = "meta";

/**
 * @author Daniel van Dijk <daniel@invidiacreative.net>
 * @since 22072020 Clean up.
 */
class Table {
    /**
     * @param {Model} Model
     */
    constructor(Model) {
        this.rows = this._createStorageForRows();

        this.propertySymbolKey = Symbol(SYMBOL_DESCRIPTION_KEY);
        this.propertySymbolMeta = Symbol(SYMBOL_DESCRIPTION_META);

        this[this.propertySymbolMeta] = this._createStorageForMeta();
        this[this.propertySymbolKey] = this._getModelTableName(Model);
    }

    /**
     * @returns {string}
     */
    getKey() {
        return this[this.propertySymbolKey];
    }

    /**
     * @param {Object} columns
     */
    insertRow(columns) {
        const modelId = columns.id || this._getNextId();

        if (this.rows[modelId]) {
            this._createErrorNonUniqueRowIdForInsertion();
        } else {
            this.rows[modelId] = {
                ...columns,
                id: modelId,
            };

            this._getMeta().lastId++;
        }
    }

    /**
     * @param {string} rowId
     * @param {Object} columns
     */
    updateRow(rowId, columns) {
        Object.assign(this.rows[rowId], columns);
    }

    /**
     * @param {Object} columns
     */
    upsertRow(columns) {
        if (this.rows[columns.id]) {
            this.updateRow(columns.id, columns);
        } else {
            this.insertRow(columns);
        }
    }

    /**
     * @param {string} rowId
     */
    deleteRow(rowId) {
        delete this.rows[rowId];
    }

    /**
     * @returns {Object}
     */
    _getMeta() {
        return this[this.propertySymbolMeta];
    }

    /**
     * @returns {Object}
     */
    _createStorageForRows() {
        return {};
    }

    /**
     * @returns {Object}
     */
    _createStorageForMeta() {
        return { lastId: 0 };
    }

    /**
     * @returns {number}
     */
    _getNextId() {
        return this._getMeta().lastId + 1;
    }

    /**
     * @param {Model} Model
     *
     * @returns {string}
     */
    _getModelTableName(Model) {
        return `${TABLE_NAME_BASE}${Model.toString().toLowerCase()}`;
    }

    /**
     * @throws {ValidationError}
     */
    _createErrorNonUniqueRowIdForInsertion() {
        throw new ValidationError("Cannot insert new row with non-unique ID.");
    }
}

export { Table };
