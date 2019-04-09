import { ToolsTemplatePage } from './app.po';

describe('Tools App', function() {
  let page: ToolsTemplatePage;

  beforeEach(() => {
    page = new ToolsTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
