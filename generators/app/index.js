const Generator = require('yeoman-generator'),
	path = require('path'),
	glob = require('glob');

module.exports = class extends Generator {

	prompting() {
		return this.prompt([{
			type: 'input',
			name: 'projectname',
			message: 'How do you want to name this project?',
			validate: (s) => {
				if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
					return true;
				}
				return 'Please use alpha numeric characters only for the project name.';
			},
			default: 'myUI5App'
		}, {
			type: 'input',
			name: 'namespace',
			message: 'Which namespace do you want to use?',
			validate: (s) => {
				if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
					return true;
				}
				return 'Please use alpha numeric characters and dots only for the namespace.';
			},
			default: 'com.org'
		}, {
			type: 'list',
			name: 'ui5type',
			message: 'Which ui5 type do you want to use?',
			choices: ['openui5', 'sapui5'],
			default: 'openui5'
		}, {
			type: 'input',
			name: 'ui5version',
			message: 'Which ui5 version do you want to use?',
			validate: (s) => {
				if (s === '') {
					return true;
				} else if (/^[0-9].[0-9].[0-9]$/g.test(s)) {
					return true;
				}
				return 'Please enter a correct ui5 version. Please find out more information at: https://sapui5.hana.ondemand.com/versionoverview.html';
			},
			default: ''
		}, {
			type: 'list',
			name: 'viewtype',
			message: 'Which view type do you want to use?',
			choices: ['XML', 'JSON', 'JS', 'HTML'],
			default: 'XML'
		}, {
			type: 'input',
			name: 'viewname',
			message: 'How do you want to name your main view?',
			validate: (s) => {
				if (/^[a-zA-Z0-9_\.]*$/g.test(s)) {
					return true;
				}
				return 'Please use alpha numeric characters only for the view name.';
			},
			default: 'InitView'
		}, {
			type: 'list',
			name: 'load_node_modules',
			message: 'Do you want to initialize node_modules?',
			choices: ['Yes', 'No'],
			default: 'Yes'
		}]).then((answers) => {
			this.destinationRoot(`${answers.projectname}`);
			if (answers.ui5version !== "") {
				answers.ui5version = "/" + answers.ui5version;
			}
			this.config.set(answers)
		});
	}

	writing() {
		const sViewName = this.config.get('viewname');
		const sViewType = this.config.get('viewtype');

		this.sourceRoot(path.join(__dirname, 'templates'));
		glob.sync('**', {
			cwd: this.sourceRoot(),
			nodir: true
		}).forEach((file) => {
			const sOrigin = this.templatePath(file);
			const sTarget = this.destinationPath(file.replace(/^_/, '').replace(/\$ViewType/, sViewType).replace(/\$ViewEnding/, sViewType.toLowerCase()).replace(/\$ViewName/, sViewName));

			this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
		});

		const oSubGen = Object.assign({}, this.config.getAll());
		oSubGen.isSubgeneratorCall = true;
		oSubGen.cwd = this.destinationRoot();

		this.composeWith(require.resolve('../newview'), oSubGen);

	}

	install() {
		const load_node_modules = this.config.get('load_node_modules');
		if (load_node_modules === 'Yes') {
			this.installDependencies({
				bower: false,
				npm: true
			});
		}
	}
};
