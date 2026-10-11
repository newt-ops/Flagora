import { memo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import type { Continent } from '@flagora/shared';
import worldData from '../assets/world-110m.json';
import {
  getContinentFromGeoId,
  isAntarctica,
  getContinentStyle,
  getContinentCamera,
  getContinentFantasyLore,
} from './continentMapHelpers.js';
import { Sparkles } from './icons.js';

interface ContinentMapProps {
  selectedContinent: Continent;
  onSelectContinent: (continent: Continent) => void;
}

const geoJsonData = worldData as unknown as string;

export const ContinentMap = memo(function ContinentMap({
  selectedContinent,
  onSelectContinent,
}: ContinentMapProps) {
  const camera = getContinentCamera(selectedContinent);
  const lore = getContinentFantasyLore(selectedContinent);

  return (
    <div className="relative w-full rounded-2xl bg-tg-secondary-bg/60 p-2 overflow-hidden shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-b from-tg-button/10 via-transparent to-tg-button/5 pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-tg-button/20 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-tg-button/15 blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="relative w-full aspect-[2/1] flex items-center justify-center overflow-hidden rounded-xl">
        <ComposableMap
          key={selectedContinent}
          projection="geoNaturalEarth1"
          projectionConfig={{
            center: camera.center,
            scale: camera.scale,
          }}
          className="w-full h-full select-none"
        >
          <Geographies geography={geoJsonData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = geo.id;
                const antarctica = isAntarctica(geoId);
                const continent = getContinentFromGeoId(geoId);
                const style = getContinentStyle(continent, antarctica, selectedContinent);

                const handleClick = () => {
                  if (style.isClickable && continent) {
                    onSelectContinent(continent);
                  }
                };

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={handleClick}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    className={style.className}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        <div
          key={selectedContinent}
          className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 rounded-xl bg-tg-section/90 backdrop-blur-md px-2.5 py-1.5 shadow-lg animate-scale-pop pointer-events-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-tg-button/15 text-tg-button">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-black text-tg-text tracking-wide">
                {lore.realmName}
              </p>
              <p className="truncate text-[10px] text-tg-hint">
                {lore.subtitle}
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-tg-button/15 px-2.5 py-0.5 text-[10px] font-extrabold text-tg-button">
            {lore.tag}
          </div>
        </div>

        <div
          key={`lore-${selectedContinent}`}
          className="absolute bottom-1.5 left-2 right-2 rounded-lg bg-tg-section/85 backdrop-blur-sm px-2.5 py-1 text-center text-[10px] font-medium text-tg-hint pointer-events-none truncate"
        >
          {lore.loreText}
        </div>
      </div>
    </div>
  );
});
