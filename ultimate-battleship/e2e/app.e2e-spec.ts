import { UltimateBattleshipPage } from './app.po';

describe('ultimate-battleship App', function() {
  let page: UltimateBattleshipPage;

  beforeEach(() => {
    page = new UltimateBattleshipPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
