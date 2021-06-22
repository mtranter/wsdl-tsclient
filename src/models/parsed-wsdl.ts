import sanitizeFilename from "sanitize-filename";
import { Logger } from "../utils/logger";

export type DefinitionProperty =
    | {
          name: string;
          sourceName: string;
          description?: string;
          kind: "PRIMITIVE";
          isArray?: boolean;
          type: string;
      }
    | {
          name: string;
          sourceName: string;
          description?: string;
          /**
           * This definition only reference another definition instead of primitive type
           * @description helps to avoid circular referencies
           */
          kind: "REFERENCE";
          isArray?: boolean;
          ref: Definition;
      };

export interface Definition {
    /** Will be used as name of generated Definition's interface */
    name: string;
    /** Original name of Definition in WSDL */
    sourceName: string;
    description?: string;
    docs: string[];
    properties: Array<DefinitionProperty>;
}

export interface Method {
    /** Will be used as name for generated Function/Method */
    name: string;
    /** First param name (InputMessage) */
    paramName: string;
    /** First param type (InputMessage) */
    paramDefinition: null | Definition;
    /** Result type (OutputMessage) */
    returnDefinition: null | Definition;
}

export interface Port {
    /** Will be used as name of generated Port's interface */
    name: string;
    /** Original name of Port in WSDL */
    sourceName: string;
    description?: string;
    /** List of callable methods within this Port */
    methods: Array<Method>;
}

export interface Service {
    /** Will be used as name of generated Service's interface */
    name: string;
    /** Original name of Service in WSDL */
    sourceName: string;
    description?: string;
    /** List of Service's Ports */
    ports: Array<Port>;
}

export interface Options {
    caseInsensitiveNames: boolean; 
    maxStack: number;
    maxStackWarn: number;
}

const defaultOptions: Options = {
    caseInsensitiveNames: false,
    maxStack: 64,
    maxStackWarn: 32
}

export class ParsedWsdl {
    /**
     * Name is always uppercased filename of wsdl without an extension.
     * Used to generate client name of interface
     * @example "MyClient"
     */
    name: string;
    /** Original wsdl filename */
    wsdlFilename: string;
    /** Absolute basepath or url */
    wsdlPath: string;

    definitions: Array<Definition> = [];
    ports: Array<Port> = [];
    services: Array<Service> = [];

    private _options: Options;

    constructor(options: Partial<Options>) {
        this._options = {
            ...defaultOptions,
            ...options
        };
    }

    /** Find definition by it's name */
    findDefinition(definitionName: string): Definition {
        return this.definitions.find((def) => def.name === definitionName);
    }

    /**
     * To make every definition's name unique.
     * If definition with same name exists, suffix it with incremented number
     */
    findNonCollisionDefinitionName(defName: string): string {
        const definitionName = sanitizeFilename(defName);
        const isInSensitive = this._options.caseInsensitiveNames;

        const defNameToCheck = isInSensitive ? definitionName.toLowerCase() : definitionName;
        if (!this.definitions.find((def) => isInSensitive ? def.name.toLowerCase() : def.name === defNameToCheck)) {
            return definitionName;
        }
        for (let i = 1; i < this._options.maxStack; i++) {
            if (!this.definitions.find((def) => isInSensitive ? def.name.toLowerCase() : def.name === `${defNameToCheck}${i}`)) {
                return `${definitionName}${i}`;
            }
            if (i == this._options.maxStackWarn) {
                Logger.warn(`Too many definition with same name "${definitionName}", will throw an exception at ${this._options.maxStack}`);
            }
        }
        throw new Error(`Out of stack (${this._options.maxStack}) for "${definitionName}", there's probably cyclic definition. You can also try to increase maxStack with --TODO option`);
    }
}
