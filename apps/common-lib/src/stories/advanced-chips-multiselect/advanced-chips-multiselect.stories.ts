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

let primaryModel = {
  opts: ["Initial option"]
}

export const Primary: Story = {
  name: "Affichage du componsant",
  render: () => ({
    props: {
      placeholder: "helloworld",
      options: primaryModel.opts,
      onInputChange: (value: string) => {
        console.log("onInputChange", value)
        primaryModel.opts.splice(0, primaryModel.opts.length);
        primaryModel.opts.push(value)
      },
    }
  })
}
