
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";

import { DisplayDateComponent } from "../../lib/components/display-date/display-date.component";
import { DatePipe } from "@angular/common";


const meta: Meta<DisplayDateComponent> = {
  component: DisplayDateComponent,

  decorators: [
    moduleMetadata({

      providers: [
        DatePipe
      ]
    })
  ]
}

export default meta;


type Story = StoryObj<DisplayDateComponent>;

export const Primary: Story = {
  name: "Afficher la date courante",
  render: () => ({
    props: {
      date: new Date()
    }
  })
}
