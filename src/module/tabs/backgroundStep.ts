/*
  Functions used exclusively on the Background tab
*/
import * as Utils from '../utils';
import * as Constants from '../constants';
import { Step, StepEnum } from '../Step';
import TextInputOption from '../options/TextInputOption';
import MultiOption from '../options/MultiOption';
import SelectableOption from '../options/SelectableOption';
import OptionsContainer from '../options/OptionsContainer';
import { Skill, SkillLabel } from '../types/Skill';
import { Alignment, AlignmentLabel } from '../types/Alignment';
import { Tool, ToolLabel } from '../types/Tool';
import { Language, LanguageLabel } from '../types/Language';

class _BackgroundTab extends Step {
  constructor() {
    super(StepEnum.Background);
  }

  section = () => $('#backgroundDiv');

  setListeners(): void {
    /* IMPLEMENT AS NEEDED */
  }

  setSourceData(): void {
    /* IMPLEMENT AS NEEDED */
  }

  async renderData() {
    // show rules on the side panel
    const backgroundRulesItem = await Utils.getJournalFromCompendiumByName(
      Constants.DND5E_COMPENDIUMS.RULES,
      'Backgrounds',
    );
    $('[data-hct_background_description]', this.section()).html(
      TextEditor.enrichHTML((backgroundRulesItem as any).content),
    );

    // background name
    const nameOption = new TextInputOption(
      this.step,
      'data.details.background',
      game.i18n.localize('HCT.Background.NamePlaceholder'),
      '',
      false,
    );
    nameOption.render($('[data-hct_area=name]', this.section()));
    this.stepOptions.push(nameOption);

    // alignment
    const alignmentOptions: { key: string; value: string }[] = Object.values(Alignment)
      .filter((v) => !isNaN(v as any))
      .map((v) => {
        const alignment = game.i18n.localize(AlignmentLabel[v as Alignment]);
        return { key: alignment, value: alignment };
      });
    const alignmentOption = new SelectableOption(this.step, 'data.details.alignment', alignmentOptions, '', false);
    alignmentOption.render($('[data-hct_area=alignment]', this.section()));
    this.stepOptions.push(alignmentOption);

    // create skills
    const $proficienciesArea = $('[data-hct_area=proficiences]', this.section());
    const skillOptions: { key: string; value: string }[] = Object.values(Skill).map((s) => {
      return { key: s, value: game.i18n.localize(SkillLabel[s as Skill]) };
    });
    const skillsContainer: OptionsContainer = new OptionsContainer(
      game.i18n.localize('HCT.Common.SkillProficiencies'),
      [new MultiOption(this.step, 'skills', skillOptions, 2, ' ', true, true)],
    );
    skillsContainer.render($proficienciesArea);
    this.stepOptions.push(...skillsContainer.options);

    const toolOptions: { key: string; value: string }[] = Object.values(Tool).map((s) => {
      return { key: s, value: game.i18n.localize(ToolLabel[s as Tool]) };
    });
    const toolsContainer: OptionsContainer = new OptionsContainer(game.i18n.localize('DND5E.TraitToolProf'), [
      new MultiOption(this.step, 'toolProf', toolOptions, 0, ' ', true, true),
    ]);
    toolsContainer.render($proficienciesArea);
    this.stepOptions.push(...toolsContainer.options);

    const languageOptions: { key: string; value: string }[] = Object.values(Language).map((s) => {
      return { key: s, value: game.i18n.localize(LanguageLabel[s as Language]) };
    });
    const languagesContainer: OptionsContainer = new OptionsContainer(
      game.i18n.localize('HCT.Common.LanguageProficiencies'),
      [new MultiOption(this.step, 'languages', languageOptions, 0, ' ', true, true)],
    );
    languagesContainer.render($proficienciesArea);
    this.stepOptions.push(...languagesContainer.options);
  }
}
const BackgroundTab: Step = new _BackgroundTab();
export default BackgroundTab;
