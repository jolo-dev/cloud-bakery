// eslint-disable-next-line @typescript-eslint/no-require-imports
import * as inquirer from 'inquirer';
import { Cli } from '../src/cli';

jest.mock('inquirer');

describe('Inquirer', () => {
  const mockValue = [{ value: 'Test1' }, { value: 'Test2' }];
  let getListOfResourcesSpy: any;
  let cli: Cli;
  beforeEach(() => {
    getListOfResourcesSpy = jest.spyOn(Cli.prototype as any, 'getListOfResources');
    getListOfResourcesSpy.mockReturnValue(mockValue);
    cli = new Cli();
  });

  it('should make sure the private getListOfResource method had been called', async () => {
    expect(getListOfResourcesSpy).toHaveBeenCalled();
    // await expect(await cli.whatToBake()).resolves.not.toThrow();
  });

  it('should inquirer the questions what to bake', async () => {
    // @ts-ignore
    inquirer.prompt.mockResolvedValue({ resources: 'Test1' });
    await expect(cli.whatToBake()).resolves.toEqual({ resources: 'Test1' });
  });

  afterEach(() => {
    getListOfResourcesSpy.mockRestore();
  });
});