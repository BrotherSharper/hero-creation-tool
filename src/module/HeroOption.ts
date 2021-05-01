import HeroData from './HeroData';
import { StepEnum } from './Step';
import * as Constants from './constants';
import { getValueFromInnerProperty } from './utils';

/**
 * Represents an option that will be reflected on the final hero.
 * @interface
 */
export interface HeroOption {
  render(parent: JQuery): void;
  value(): any;
  isFulfilled(): boolean;
  applyToHero(actor: HeroData): void;
  getReviewText(): string;
  addValues: boolean;
  key: string;
  origin: StepEnum;
}

const apply = (existingData: HeroData, key: string, value: any, addValues: boolean) => {
  const dataSnapshot: any = {};
  if (addValues) {
    // find any previous value on existing data
    dataSnapshot[key] = getValueFromInnerProperty(existingData, key);
    value = dataSnapshot[key] ? dataSnapshot[key] + value : value;
  }
  dataSnapshot[key] = value;
  mergeObject(existingData, dataSnapshot, Constants.MERGE_OPTIONS);
};

export class HeroOptionsContainer {
  constructor(readonly title: string, public options: HeroOption[] = []) {}
}

/**
 * Represents a fixed value that will be imprinted into the created actor
 * (e.g. how all Elves get Perception proficiency)
 * @class
 */
export class FixedHeroOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    private option: any,
    private textToShow: string,
    readonly reviewText: string,
    readonly addValues: boolean = false,
  ) {}

  isFulfilled() {
    return !!this.option;
  }

  applyToHero(actor: HeroData) {
    apply(actor, this.key, this.value(), this.addValues);
  }

  private $elem = $('<p>').text(`${this.textToShow}`);

  /**
   * Builds the HTML element for this option and appends it to the parent
   * @param {JQuery} parent
   */
  render(parent: JQuery): void {
    parent.append(this.$elem);
  }

  /**
   * @returns the current value of this option
   */
  value(): any {
    return this.option;
  }

  getReviewText = () => this.reviewText;
}

/**
 * Represents a value needs to be selected by the player with a single output onto the created actor.
 * (e.g. Dwarven's Tool Proficiency is a single option between three defined ones)
 * @class
 */
export class SelectableHeroOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    private options: { key: string; value: string }[],
    private label: string,
    readonly reviewTemplate: string,
    readonly addValues: boolean = false,
  ) {}

  isFulfilled() {
    return !!this.value();
  }

  applyToHero(actor: HeroData) {
    apply(actor, this.key, this.value(), this.addValues);
  }

  $elem: JQuery = $(`<select>
        <option value="" selected disabled hidden>${game.i18n.localize(
          'HCT.Race.ProficiencySelectPlaceholder',
        )}</option>
      ${this.options.map((option) => `<option value="${option.key}">${game.i18n.localize(option.value)}</option>`)}
    </select>`);

  /**
   * Builds the HTML element for this option and appends it to the parent
   * @param {JQuery} parent
   */
  render(parent: JQuery): void {
    const $block = $('<div>');
    $block.append($('<span>').text(this.label));
    $block.append(this.$elem);
    parent.append($block);
  }

  /**
   * @returns the current value of this option
   */
  value(): any {
    return this.$elem.val();
  }

  getReviewText(): string {
    const val: string = this.value() || '';
    return game.i18n.format(this.reviewTemplate, { value: val.capitalize() });
  }
}

/**
 * Represents an array of values selected by the player for the created actor.
 * (e.g. A class allowing to pick 2 skills from a list)
 * @class
 */
export class MultiHeroOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    private options: { key: string; value: string }[],
    private quantity: number,
    private label: string,
    readonly reviewTemplate: string,
    readonly addValues: boolean = false,
  ) {}

  isFulfilled() {
    return this.value().length > 0;
  }

  applyToHero(actor: HeroData) {
    apply(actor, this.key, this.value(), this.addValues);
  }

  $elem: JQuery = $();

  /**
   * Builds the HTML element for this option and appends it to the parent
   * @param {JQuery} parent
   */
  render(parent: JQuery): void {
    this.$elem = $(`<fieldset>
        <legend>${this.label}(${this.quantity})</legend>
          ${this.options
            .map(
              (option) =>
                `<div><label><input type="checkbox" name="${option.key}" value="${option.key}"> ${game.i18n.localize(
                  option.value,
                )}</label></div>`,
            )
            .join('')}
        </fieldset>`);
    parent.append(this.$elem);
  }

  /**
   * @returns the current value of this option
   */
  value(): any[] {
    const values: any[] = [];
    $(':checked', this.$elem).each(function (index, input) {
      values.push((input as HTMLInputElement).value);
    });
    return values; // this are the KEYS
  }

  getReviewText(): string {
    const val: string = this.value()
      ? this.value()
          .map((v) => v.capitalize())
          .join(', ')
      : '';
    return game.i18n.format(this.reviewTemplate, { value: val });
  }
}

/**
 * Represents a manually inputed value by the player for the created actor.
 * Expected to be a String, but should be reasonably easy to use it for numbers or expand it for that use.
 * e.g. Hero name
 * @class
 */
export class TextInputHeroOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    private placeholder: string,
    private val: string,
    readonly reviewTemplate: string,
    readonly addValues: boolean = false,
  ) {}

  $elem!: JQuery;

  render($parent: JQuery<HTMLElement>): void {
    this.$elem = $(`<input type="text" placeholder=${this.placeholder} value=${this.val}>`);
    $parent.append(this.$elem);
  }

  value() {
    return this.$elem.val();
  }

  isFulfilled(): boolean {
    return !!this.$elem.val();
  }

  applyToHero(actor: HeroData) {
    apply(actor, this.key, this.value(), this.addValues);
  }

  getReviewText(): string {
    const val = this.value() || '';
    return game.i18n.format(this.reviewTemplate, { value: val });
  }
}

/**
 * Represents a value that is given to the created actor but doesn't need user input (and is not shown on the review)
 * e.g. the foundry Items that will be added to the Actor, like Race/Class.
 * @class
 */
export class HiddenHeroOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    readonly reviewText = '',
    readonly opt: any,
    readonly addValues: boolean = false,
  ) {}

  render(parent: JQuery<HTMLElement>): void {
    throw new Error('Hidden hero options should not be rendered');
  }

  value(): any {
    return this.opt;
  }

  isFulfilled(): boolean {
    return !!this.value();
  }

  applyToHero(actor: HeroData): void {
    apply(actor, this.key, this.value(), this.addValues);
  }

  getReviewText(): string {
    return '';
  }
}
