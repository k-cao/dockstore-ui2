/**
 * Dockstore API
 * This describes the dockstore API, a webservice that manages pairs of Docker images and associated metadata such as CWL documents and Dockerfiles used to build those images
 *
 * OpenAPI spec version: 1.3.0
 * Contact: theglobalalliance@genomicsandhealth.org
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


/**
 * A tool version describes a particular iteration of a tool as described by a reference to a specific image and/or documents.
 */
export interface ToolVersion {
    /**
     * The name of the version.
     */
    name?: string;
    /**
     * The URL for this tool in this registry
     */
    url: string;
    /**
     * An identifier of the version of this tool for this particular tool registry
     */
    id: string;
    /**
     * The docker path to the image (and version) for this tool
     */
    image?: string;
    /**
     * A URL to a Singularity registry is provided when a specific type of image does not use ids in the Docker format. Used along with image_name to locate a specific image.
     */
    registry_url?: string;
    /**
     * Used in conjunction with a registry_url if provided to locate images
     */
    image_name?: string;
    /**
     * The type (or types) of descriptors available.
     */
    descriptor_type?: Array<ToolVersion.DescriptorTypeEnum>;
    /**
     * Reports if this tool has a containerfile available.
     */
    containerfile?: boolean;
    /**
     * The version of this tool version in the registry. Iterates when fields like the description, author, etc. are updated.
     */
    meta_version: string;
    /**
     * Reports whether this tool has been verified by a specific organization or individual
     */
    verified?: boolean;
    /**
     * Source of metadata that can support a verified tool, such as an email or URL
     */
    verified_source?: string;
}
export namespace ToolVersion {
    export type DescriptorTypeEnum = 'CWL' | 'WDL' | 'NFL';
    export const DescriptorTypeEnum = {
        CWL: 'CWL' as DescriptorTypeEnum,
        WDL: 'WDL' as DescriptorTypeEnum,
        NFL: 'NFL' as DescriptorTypeEnum
    }
}
