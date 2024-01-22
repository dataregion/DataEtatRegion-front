import { test, expect, Page } from "@playwright/test"
import mockRefApi from "../utils/mock-api";

test.describe("Lorsque l'on définit le paramètre `grouper_par`", () => {
  const urlparam = "?programmes=107&grouper_par=theme,beneficiaire";

  test("Les colonnes de grouping sont pré-remplies", async ({ page }) => {
    await _navigate(page, `/${urlparam}`)

    await page.getByTestId("group-by-btn").click();

    const group_choices = page.getByTestId('group-choice-dialog')

    await expect(group_choices).toContainText("Thème")
    await expect(group_choices).toContainText("Siret")
    await expect(group_choices).not.toContainText("Programme")
  })
});

test.describe("Lorsque l'on définit le paramètre `grouper_par` invalide", () => {
  const urlparam = "?programmes=107&grouper_par=inexistant";

  test("Une erreur s'affiche avec un message compréhensible", async ({ page }) => {
    await page.goto(urlparam);

    const error_message = page.getByTestId('search-cmp-error-msg')

    await expect(error_message).toContainText("inexistant n'est pas un membre de")
  })
});

test.describe("Lorsque l'on spécifie deux programmes", () => {
  const urlparam = `?programmes=101,102`;
  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);

    const programmes = page.getByTestId("programmes-form-field")
    const annees = page.getByTestId("annees-form-field")

    await expect(programmes).toContainText('101')
    await expect(programmes).toContainText('Accès au droit et à la justice')
    await expect(programmes).toContainText('102')
    await expect(programmes).toContainText("Accès et retour à l'emploi")
    await expect(programmes).not.toContainText("103")
    await expect(programmes).not.toContainText("Accompagnement des mutations")

    // Puisque, par défaut, on choisit l'année courante
    const curr = `${new Date().getFullYear()}`;
    await expect(annees).toContainText(curr);
  });
});

test.describe("Lorsque l'on spécifie une localisation", () => {
  const urlparam = `?niveau_geo=departement&code_geo=35`;

  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);

    const localisation = page.getByTestId('localisation-select')

    await expect(localisation).toContainText("Ille-et-Vilaine");
  });
});

test.describe("Lorsque l'on spécifie une commune qui n'est pas dans les 100 premières de France", () => {
  const urlparam = `?niveau_geo=commune&code_geo=35238`;

  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);

    const localisation = page.getByTestId('localisation-select')

    await expect(localisation).toContainText("Rennes");
  });
});

test.describe("Lorsque l'on spécifie une localisation QPV", () => {
  const urlparam = `?niveau_geo=qpv&code_geo=QP001001`;

  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);

    const localisation = page.getByTestId('localisation-select')

    await expect(localisation).toContainText("QP001001");
  });
});

test.describe("Lorsque l'on spécifie une année min/max", () => {
  const urlparam = `?annee_min=2019&annee_max=2020`;

  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);

    const annees = page.getByTestId('annees-form-field');

    await expect(annees).toContainText("2019");
    await expect(annees).toContainText("2020");
    await expect(annees).not.toContainText("2023");
  });
});

test.describe("Lorsque l'on spécifie le plein écran", () => {
  const urlparam = `?programmes=107&plein_ecran=true`

  test("Les filtres sont pré-remplis", async ({page}) => {
    await _navigate(page, `/${urlparam}`);
    await expect(page.getByTestId('toggle-grid-fullscreen-btn')).toContainText("Rétrécir");
  })
})

test.describe("Lorsque l'on spécifie des bénéficiaires", () => {
  const urlparam = "?beneficiaires=30613890001294,30613890003688";

  test("Les filtres sont pré-remplis", async ({page}) => {
      await page.route(
        /.*\/budget\/api\/v1\/beneficiaire.*/,
        async (route: any, request:any) => {
          const args = request.url().split('/');
          const siret = args[args.length - 1];

          const json = { "denomination": "DECATHLON", "siret":siret};
          await route.fulfill({ json });
        }
      );

    await _navigate(page, `/${urlparam}`);

    const locator = page.getByTestId('search-beneficiaires-control')
    await expect(locator).toContainText("30613890001294")
    await expect(locator).toContainText("30613890003688")
    await expect(locator).toContainText("DECATHLON")
  })
})

test.describe("Lorsque l'on spécifie des domaines fonctionnels", () => {
  const urlparam = "?domaines_fonctionnels=0103-03-02&annee_min=2019&annee_max=2019";

  test("Un message notifie que l'on recherche également sur le domaine fonctionnel", async({ page }) => {
    await _navigate(page, `/${urlparam}`);

    await expect(page.getByTestId('notif-additionnal-search-on-domaines-fonctionnels'))
      .toContainText("filtre sur le domaine fonctionnel")
  })
})

test.describe("Lorsque l'on spécifie des referentiels de programmation", () => {
  const urlparam = "?referentiels_programmation=010101040101&annee_min=2019&annee_max=2019";

  test("Les filtres sont pré remplis", async ({ page }) => {
    await _navigate(page, `/${urlparam}`);
    const refProgrammation = page.getByTestId('ref-programmation-form-field')
    await expect(refProgrammation).toContainText("010101040101");
  });
})

test.describe("Lorsque l'on spécifie des regions source", () => {
  const urlparam = "?source_region=035,53&annee_min=2022&annee_max=2022&programmes=107";

  test("Un message notifie que l'on recherche également sur les source de region", async({ page }) => {
    await page.goto(urlparam);

    await expect(page.getByTestId('notif-additionnal-search-on-source-region'))
      .toContainText("filtre sur la source region")
  })
})


async function _navigate(page: Page, url: string) {
    await mockRefApi(page);
    await page.goto(url);
}
