'use strict';
require('validate-peer-dependencies')(__dirname);
let VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    let emberChecker = new VersionChecker(this.project).for('ember-source');

    if (!emberChecker.gte('3.27.0')) {
      throw new Error(
        'ember-template-imports requires ember-source 3.27.0 or higher'
      );
    }

    const semver = require('semver');

    let babel = this.project.findAddonByName('ember-cli-babel');
    let hasBabel = babel !== undefined;
    let babelVersion = hasBabel && babel.pkg.version;
    let hasValidBabelVersion = hasBabel && semver.gte(babelVersion, '8.0.0');

    if (!hasValidBabelVersion) {
      throw new Error('ember-template-imports requires ember-cli-babel with at least version 8.0.0');
    }

    // Used in ember-cli-htmlbars to get the location of templateCompiler without traversing this.addons (https://github.com/ember-cli/ember-cli-htmlbars/blob/6860beed9a357d5e948abd09754e8a978fed1320/lib/ember-addon-main.js#L264)
    let ember = this.project.findAddonByName('ember-source');

    this.templateCompilerPath = ember.absolutePaths.templateCompiler;
  },

  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      let TemplateImportPreprocessor = require('./src/preprocessor-plugin');
      registry.add(
        'js',
        new TemplateImportPreprocessor(() => this.templateCompilerPath)
      );
    }
  },
};
