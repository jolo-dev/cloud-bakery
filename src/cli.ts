import { prompt } from 'inquirer';
import { Resources } from './main';

export interface Choice {
  // name: string;
  value: string;
}

export class Cli {

  private listOfResource;

  constructor() {
    this.listOfResource = this.getListOfResources();
  }

  public async whatToBake() {
    try {
      const answers = await prompt([{
        name: 'resources',
        type: 'list',
        message: '👩‍🍳🧑‍🍳 What do you would like to bake?',
        choices: this.listOfResource,
      }]);
      return answers;
    } catch (error) {
      console.log(error);
    }
  }

  private getListOfResources() {
    const resources = Object.keys(Resources).map(key => ({ value: Object(Resources)[key] }));
    return resources;
  }
}