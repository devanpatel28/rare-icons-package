
# RareIcons

A customizable SVG icon library for React and Next.js.

## Installation

```bash
npm install rare-icons
```

## Usage

```tsx
import { Home, Gps1, AccountSetting1 } from "rare-icons";

export default function Example() {
  return (
    <div className="flex items-center gap-4">
      <Home className="text-2xl text-blue-500" />
      <Gps1 className="text-lg text-red-500" />
      <AccountSetting1 className="size-8 text-green-500" />
    </div>
  );
}
```

## CSS styling

```css
.custom-icon {
  font-size: 24px;
  color: royalblue;
}
```

```tsx
<Home className="custom-icon" />
```

## Features

- SVG icons for React and Next.js
- TypeScript declarations
- CSS and Tailwind CSS styling
- Inherited color using currentColor
- Font-size-based dimensions

## License

MIT
