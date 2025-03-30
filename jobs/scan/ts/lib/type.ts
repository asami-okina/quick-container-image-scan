export type ScanResultsType = {
  SchemaVersion: number;
  CreatedAt: string;
  ArtifactName: string;
  Results: Result[];
};

export type Result = {
  Target: string;
  Class: string; // "os-pkgs" | "lang-pkgs" | "config" | "secret" | "license" | "license-file" | "custom"
  Type: string;
  Packages?: Package[];
  Vulnerabilities?: Vulnerability[];
  Licenses?: License[];
};

export type Package = {
  ID: string;
  Name: string;
  Identifier: {
    PURL?: string;
    UID?: string;
    BOMRef?: string;
  };
  Version: string;
  Release?: string;
  Epoch?: number;
  Arch?: string;
  Dev?: boolean;
  SrcName?: string;
  SrcVersion?: string;
  SrcRelease?: string;
  SrcEpoch?: number;
  Licenses?: string[];
  Maintainer?: string;
  Modularitylabel?: string;
  BuildInfo?: {
    ContentSets?: string[];
    Nvr?: string;
    Arch?: string;
  };
  Indirect?: boolean;
  Relationship?: string; // "unknown" | "root" | "workspace" | "direct" | "indirect"
  DependsOn?: string[];
  Layer?: {
    Digest: string;
    DiffID: string;
    CreatedBy: string;
  };
  FilePath?: string;
  Digest?: string;
  Locations?: {
    StartLine: number;
    EndLine: number;
  }[];
  InstalledFiles?: string[];
};

export type Vulnerability = {
  VulnerabilityID: string;
  VendorIDs?: string[];
  PkgID?: string;
  PkgName: string;
  PkgPath?: string;
  PkgIdentifier?: {
    PURL?: string;
    UID?: string;
    BOMRef?: string;
  };
  InstalledVersion: string;
  FixedVersion?: string;
  Status?: string;
  Layer?: {
    Digest: string;
    DiffID: string;
    CreatedBy: string;
  };
  SeveritySource?: string;
  PrimaryURL?: string;
  DataSource?: {
    ID: string;
    Name: string;
    URL: string;
  };
  Title?: string;
  Description?: string;
  Severity?: string;
  CweIDs?: string[];
  CVSS?: {
    V2Vector?: string;
    V2Score?: number;
    V3Vector?: string;
    V3Score?: number;
  };
  References?: string[];
  PublishedDate?: string;
  LastModifiedDate?: string;
};

export type License = {
  Severity: string;
  Category: string;
  PkgName?: string;
  FilePath?: string;
  Name: string;
  Text?: string;
  Confidence: number;
  Link: string;
};
