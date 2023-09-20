import { moduleMetadata, type Meta, type StoryObj, applicationConfig } from "@storybook/angular";

import { provideAnimations } from "@angular/platform-browser/animations";
import { MaterialModule } from "../../public-api";
import { AdvancedChipsMultiselectComponent } from "../../lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component";


const meta: Meta<AdvancedChipsMultiselectComponent> = {
  component: AdvancedChipsMultiselectComponent,

  argTypes: { },

  decorators: [

    applicationConfig({
      providers: [provideAnimations()],
    }),

    moduleMetadata({
      imports: [
        MaterialModule
      ]
    })
  ],
}

export default meta;


type Story = StoryObj<AdvancedChipsMultiselectComponent>;

const primaryModel = {
  opts: [{ 'item': "Initial option" }, { 'item': "second option"}],
  selected: [{ 'item': "Initial option" }],
}

export const Primary: Story = {

  name: "Affichage du composant",

  render: () => ({
    props: {
      placeholder: "helloworld",
      options: primaryModel.opts,
      selectedData: primaryModel.selected,
    },
  })
}
