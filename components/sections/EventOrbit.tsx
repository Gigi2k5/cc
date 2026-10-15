import Image from "next/image";

import { EVENEMENTS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * L'anneau d'images de l'en-tête de la section Événements.
 *
 * Treize visuels posés sur un cercle : les affiches des campagnes et les
 * portraits du coin photo de la 3ᵉ édition. Le titre de section se tient au
 * centre, dans le vide de l'anneau.
 *
 * ### Ce que ce centre vide règle
 *
 * La version précédente dispersait les affiches derrière le texte, ce qui
 * obligeait à les voiler pour garder le titre lisible — donc à les rendre
 * invisibles. Un anneau n'a pas ce problème : **il n'y a rien derrière le
 * texte**. Le titre se détache sur l'encre pure, et les images peuvent être
 * montrées franchement, sans voile et sans désaturation.
 *
 * La géométrie vit dans `globals.css` (`.photo-ring`), parce que c'est une
 * chaîne de transformations CSS et non un calcul : aucune position n'est
 * calculée en JavaScript, et ce composant reste rendu côté serveur.
 *
 * Le bloc est `aria-hidden` : treize images sans rôle individuel n'ont rien à
 * annoncer une par une. Les mêmes photos reviennent avec un vrai texte
 * alternatif dans la carte de l'édition passée, où elles sont de
 * l'information et non du décor.
 */
export function EventOrbit({ className }: { className?: string }) {
  const total = EVENEMENTS.orbite.length;

  return (
    <div
      aria-hidden="true"
      className={cn("photo-ring pointer-events-none select-none", className)}
    >
      {EVENEMENTS.orbite.map((image, index) => (
        <div
          key={image.src}
          className="photo-ring-item"
          style={{ "--a": `${(360 / total) * index}deg` } as React.CSSProperties}
        >
          <div
            className="photo-ring-float"
            /* Durées premières entre elles et départs décalés : sans ça, les
               treize cartes respirent à l'unisson et l'anneau pulse comme un
               seul objet. */
            style={
              {
                "--float-d": `${8 + (index % 5) * 1.7}s`,
                "--float-delay": `${(index % 7) * 0.6}s`,
              } as React.CSSProperties
            }
          >
            <div className="overflow-hidden rounded-md border border-ligne bg-encre p-[3px] shadow-ombre">
              <Image
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                /* Les cartes mesurent au plus 110px de large, en double
                   densité : demander plus large ne ferait que télécharger du
                   détail que personne ne verra. */
                sizes="220px"
                className="aspect-[3/4] h-auto w-full rounded-sm object-cover"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
