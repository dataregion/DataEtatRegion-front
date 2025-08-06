export interface BopModelCode {
  code: string;
}

export interface BopModel extends BopModelCode {
  label: string;
  code_ministere: string;
  label_theme: string;
}

export interface ThemeModel extends BopModelCode {
  label: string;
}
