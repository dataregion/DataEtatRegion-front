import { moduleMetadata, type Meta, type StoryObj, applicationConfig } from '@storybook/angular';

import { provideAnimations } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../public-api';
import { SelectMultipleComponent } from '../../lib/components/select-multiple/select-multiple.component';
import { BopModel } from '@models/refs/bop.models';

const meta: Meta<SelectMultipleComponent<string>> = {
  component: SelectMultipleComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()]
    }),
    moduleMetadata({
      imports: [MaterialModule]
    })
  ],
  argTypes: {
    canFilter: { control: 'boolean' },
    canSelectAll: { control: 'boolean' }
  }
};

export default meta;

type StoryNumber = StoryObj<SelectMultipleComponent<number>>;
type StoryObject = StoryObj<SelectMultipleComponent<BopModel>>;

export const SelectNumber: StoryNumber = {
  name: 'Select - Number',
  render: (args) => ({
    props: {
      // Attributes
      id: 'annees-geo-select',
      placeholder: 'Années',
      class: 'field-100-width',
      // Select
      options: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
      selected: [],
      icon: 'calendar_month',
      canFilter: args.canFilter,
      canSelectAll: args.canSelectAll
    }
  }),
  args: {
    canFilter: false,
    canSelectAll: true
  }
};

const themes = {
  options: ['Old theme', 'New theme'],
  selected: ['Old theme']
};
const bops = {
  options: [
    { code: '101', code_ministere: 'CM', label: 'Old bop', label_theme: 'This is old' },
    { code: '102', code_ministere: 'CM', label: 'New bop', label_theme: 'This is new' }
  ],
  selected: []
};
const filterBops = (value: string) => {
  const filterValue = value ? value.toLowerCase() : '';
  const themesSelected = themes.selected;

  const filterGeo = bops.options.filter((option) => {
    if (themesSelected) {
      return (
        option.label_theme != null &&
        themesSelected.includes(option.label_theme) &&
        option.label?.toLowerCase().includes(filterValue)
      );
    }
    return option.label?.toLowerCase().includes(filterValue) || option.code.startsWith(filterValue);
  });

  const controlBop: BopModel[] = bops.selected;

  if (controlBop) {
    // si des BOPs sont déjà sélectionné
    return [
      ...controlBop,
      ...bops.options.filter(
        (element) =>
          controlBop.findIndex((valueSelected: BopModel) => valueSelected.code === element.code) ===
          -1
      )
    ];
  } else {
    return filterGeo;
  }
};

export const SelectObject: StoryObject = {
  name: 'Select - Object',
  render: (args) => ({
    props: {
      // Attributes
      id: 'zone-geo-select',
      placeholder: 'Programme',
      class: 'field-100-width',
      // Tooltip
      matTooltipPosition: 'above',
      matTooltip:
        'Saisir un nom ou un numéro de programme (Exemple : 102 ou Accès et retour à l’emploi)',
      // Select
      options: bops.options,
      selected: bops.selected,
      filterFunction: filterBops,
      renderFunction: (opt: BopModel) => opt.code + ' - ' + opt.label,
      // Parameters
      canFilter: args.canFilter,
      canSelectAll: args.canSelectAll
    }
  }),
  args: {
    canFilter: true,
    canSelectAll: true
  }
};
