import { AwsCdkTypeScriptApp, NodePackageManager } from 'projen';

const project = new AwsCdkTypeScriptApp({
  cdkVersion: "2.1.0",
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.PNPM,
  projenrcTs: true,
  name: 'cloud-bakery',
  authorName: 'Jolo',
  appEntrypoint:
    'main.ts' /* The CDK app's entrypoint (relative to the source directory, which is "src" by default). */,

    /* NodePackageOptions */
  // allowLibraryDependencies: true,                                           /* Allow the project to include `peerDependencies` and `bundledDependencies`. */                                                /* Author's name. */
  // authorOrganization: undefined,                                            /* Author's Organization. */
  // authorUrl: undefined,                                                     /* Author's URL / Website. */
  // autoDetectBin: true,                                                      /* Automatically add all executables under the `bin` directory to your `package.json` file under the `bin` section. */
  bin: {
    bake: './lib/main.js',
  }, /* Binary programs vended with your module. */
  // bundledDeps: undefined,                                                   /* List of dependencies to bundle into this module. */
  deps: ['validator',
    '@aws-sdk/client-route-53',
    '@aws-sdk/client-acm',
    'inquirer',
    '@types/inquirer',
    'figlet',
    'clear',
    'chalk',
    'commander'], /* Runtime dependencies of this module. */
  // description: undefined,                                                   /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@types/figlet', '@types/clear'], /* Build dependencies for this module. */
  entrypoint: './lib/main.js', /* Module entrypoint (`main` in `package.json`). */
  // homepage: undefined,                                                      /* Package's Homepage / Website. */
  // keywords: undefined,                                                      /* Keywords to include in `package.json`. */
  // license: 'Apache-2.0',                                                    /* License's SPDX identifier. */
  // licensed: true,                                                           /* Indicates if a license should be added. */
  scripts: {
    local: 'tsc -p .',
    bake: 'sudo npm i -g && bake',
  }, /* npm scripts to include. */
});

project.synth();
