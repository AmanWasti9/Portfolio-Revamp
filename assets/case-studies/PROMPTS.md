# Case-study image prompts

Generate the images, save them in this folder's project subfolders with **exactly these names**, then run `npm run images`.

```
assets/case-studies/
  beacon/   detail-1.png  detail-2.png  showcase.png
  cogni/    detail-1.png  detail-2.png  showcase.png
  pacer/    detail-1.png  detail-2.png  showcase.png
  pantry/   detail-1.png  detail-2.png  showcase.png
```

| File | Ratio | Where it appears |
|---|---|---|
| `detail-1` | 4:5 portrait | Left tall frame under "The problem" |
| `detail-2` | 4:5 portrait | Right tall frame under "The problem" |
| `showcase` | 16:9 landscape | Full-width image after "The approach" |
| `hero` (optional) | 16:9 | Replaces the current laptop shot everywhere |

Any of `.png`, `.jpg`, `.jpeg`, `.webp` works. Missing files fall back to the old zoomed crops, so you can add them one at a time.

## How to keep them consistent

1. **Attach the project's current hero shot as a reference image** (from `assets/`: `Beacon.png`, `Cogni AI Study Workspace.png`, `The Pacer Laptop on Sunlit Concrete.png`, `Pantry Traker Laptop Hero Scene.png`). This keeps the UI, logo and colours identical to the hero.
2. **Paste the shared style line at the end of every prompt.**
3. **Generate at least 2000px wide** (detail images at least 1600px wide).

**Shared style line**

> Photorealistic product photography, same scene style as the reference image: soft natural window light with long diagonal shadows, shallow depth of field, 50mm lens, calm muted neutral tones with the brand colour as the only strong accent. The on-screen UI must match the reference exactly, sharp and legible, no distorted text. No watermark, no extra logos, no people's faces.

---

## Beacon — editorial blog platform (red `#E3262C`, black, white)

**detail-1 (4:5)**
> Close-up of a smartphone lying at an angle on a dark wooden desk, showing the Beacon mobile article page: the red "B" logo, a large bold black headline, a black-and-white mountain photo and a red "Read more" button. A pair of glasses and the corner of a notebook beside it. Warm sunlight streaks across the desk.

**detail-2 (4:5)**
> Macro shot of the Beacon laptop screen focused on the "Latest Posts" section: three article cards with black-and-white photos, red category tags and bold black titles. The left edge of the screen falls softly out of focus.

**showcase (16:9)**
> Top-down flat lay on a dark desk: an open laptop showing the Beacon homepage "Read. Learn. Be Inspired.", a smartphone showing the mobile article page, a black mug with the red "B" logo, a framed poster reading "Ideas Turn Into Impact", a green plant leaf and two books titled "Design Better" and "Build Products". Long morning shadows.

## Cogni — AI study workspace (violet `#5A2BE6`, lilac, white)

**detail-1 (4:5)**
> A hand holding a smartphone above a white marble desk, the screen showing a Cogni flashcard reading "What is Machine Learning?" with a violet "Show answer" button. Headphones and a stack of books titled "Artificial Intelligence" blurred in the background.

**detail-2 (4:5)**
> Macro shot of the Cogni laptop screen focused on the AI chat: the question bubble "What are the key points?" with a violet send button, above a "Summary" panel with neat text lines. Lilac UI tones, soft focus fall-off at the edges.

**showcase (16:9)**
> A bright study desk with an open laptop showing the Cogni homepage "Upload. Learn. Ask. Remember.", a tablet propped beside it showing two Cogni flashcards, a white mug with the violet Cogni star logo, black headphones and a spiral notebook. Soft daylight from the left.

## The Pacer — sneaker storefront (signal red `#E3141B`, black, concrete)

**detail-1 (4:5)**
> A smartphone resting on raw concrete steps showing The Pacer product page: a white running sneaker on a black background, the price and a red "Add to cart" button. A real white sneaker sits next to the phone. Harsh sunlight with sharp diagonal shadows.

**detail-2 (4:5)**
> Macro shot of The Pacer laptop screen focused on the dark product grid: four white and black sneakers on black cards with red price tags, and the stats "+150 Comfort Sneakers  +1000 Customers". Concrete texture visible at the edge.

**showcase (16:9)**
> Wide shot of concrete steps in strong sunlight: an open laptop showing The Pacer homepage "Power That You Run" with the athlete mid-jump, a smartphone beside it showing the product page, and a pair of white running sneakers on the step above. Bold diagonal shadow lines across the scene.

## Pantry Traker — grocery inventory app (basil `#1D6B33`, sage, oat)

**detail-1 (4:5)**
> A hand holding a smartphone in a bright kitchen, the screen showing the Pantry Traker "Your Pantry" list: Milk "2 left", Eggs "1 pack", Bread "Good", Apples "4 left", with a "Low Stock!" notification popping in at the top. A basket of fresh vegetables blurred behind.

**detail-2 (4:5)**
> Macro shot of the Pantry Traker phone screen focused on the green category chips "All, Fresh, Dry, Frozen" and the yellow bell "Low Stock!" alert, resting on a light oak kitchen counter with a glass jar of pasta beside it.

**showcase (16:9)**
> A sunny kitchen counter: an open laptop showing the Pantry Traker homepage "Track Your Pantry, Smarter.", a smartphone showing the pantry list, glass jars of rice and pasta, fresh apples and a loaf of bread, a small potted herb. Soft morning light, clean and fresh.
