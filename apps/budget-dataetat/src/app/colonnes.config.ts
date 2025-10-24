import { ApplicationRef } from '@angular/core';
import { ListeDesColonnesService } from 'apps/clients/v3/financial-data';
import { ColonnesMapperService } from './services/colonnes-mapper.service';
import { ColonnesService } from './services/colonnes.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { forkJoin, firstValueFrom } from 'rxjs';

/**
 * Initialise les colonnes au démarrage de l'application
 */
async function initializeColonnes(
  colonnesService: ListeDesColonnesService,
  colonnesMapperService: ColonnesMapperService,
  colonnesUiService: ColonnesService,
  logger: LoggerService
): Promise<void> {
  logger.info('🔄 Initialisation des colonnes au démarrage de l\'application');
  
  try {
    const [fetchedColonnesTable, fetchedColonnesGrouping] = await firstValueFrom(forkJoin([
      colonnesService.getColonnesTableauColonnesTableauGet(),
      colonnesService.getColonnesGroupingColonnesGroupingGet()
    ]));
    
    // Initialisation du service de mapper avec les colonnes récupérées
    colonnesMapperService.initService(
      fetchedColonnesTable.data ?? [],
      fetchedColonnesGrouping.data ?? []
    );
    
    // Sauvegarde des colonnes disponibles dans le service de colonnes UI
    colonnesUiService.allColonnesTable.set(colonnesMapperService.colonnes);
    colonnesUiService.selectedColonnesTable.set(colonnesMapperService.getDefaults());
    colonnesUiService.allColonnesGrouping.set(colonnesMapperService.colonnes.filter(c => c.grouping !== undefined));
    
    logger.info('✅ Colonnes initialisées avec succès au démarrage');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des colonnes:', error);
    throw error;
  }
}

/**
 * Configure et lance l'initialisation des colonnes après le bootstrap de l'application
 * 
 * @param bootstrapPromise - Promise retournée par bootstrapApplication
 */
export function configureColonnesInitialization(bootstrapPromise: Promise<ApplicationRef>): void {
  bootstrapPromise.then(async (appRef) => {
    const colonnesService = appRef.injector.get(ListeDesColonnesService);
    const colonnesMapperService = appRef.injector.get(ColonnesMapperService);
    const colonnesUiService = appRef.injector.get(ColonnesService);
    const logger = appRef.injector.get(LoggerService);
    
    // Initialisation des colonnes après le bootstrap
    await initializeColonnes(colonnesService, colonnesMapperService, colonnesUiService, logger);
  }).catch(err => {
    console.error('❌ Erreur lors de l\'initialisation des colonnes:', err);
    throw err;
  });
}