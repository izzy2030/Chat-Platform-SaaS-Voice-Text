# Widget Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the new "Widget Builder" interface matching the provided screenshots, consolidating creation and editing into `/admin/widget/[widgetId]` and updating the Convex schema to support the new fields.

**Architecture:** We will add the required design and content fields to the `widgets` table schema. The Hub (`/admin/widget`) will create a default widget and redirect to the Studio (`/admin/widget/[widgetId]`). The Studio will feature three tabs: "Content", "Design", and "Embed", matching the fields from the screenshots. The preview will automatically reflect these settings.

**Tech Stack:** Next.js, React Hook Form, Zod, Tailwind CSS, Convex, Lucide React.

---

### Task 1: Update Convex Schema & APIs

**Files:**
- Modify: `convex/schema.ts`
- Modify: `convex/widgets.ts`

- [ ] **Step 1: Update `convex/schema.ts`**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  widgets: defineTable({
    name: v.string(), // "Widget Title" in Content tab
    projectId: v.id("projects"),
    type: v.union(v.literal("text"), v.literal("voice")),
    webhookUrl: v.string(),
    allowedDomains: v.array(v.string()),
    userId: v.string(),
    theme: v.optional(
      v.object({
        // Content Tab
        headerTitle: v.optional(v.string()), // Alias for Widget Title
        headerSubtitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        placeholderText: v.optional(v.string()),
        botName: v.optional(v.string()),
        showBranding: v.optional(v.boolean()),

        // Design Tab
        accentColor: v.optional(v.string()),
        headerTextColor: v.optional(v.string()),
        chatBackgroundColor: v.optional(v.string()),
        botBubbleBgColor: v.optional(v.string()),
        botTextColor: v.optional(v.string()),
        userTextColor: v.optional(v.string()),
        inputBgColor: v.optional(v.string()),
        inputTextColor: v.optional(v.string()),
        inputBorderColor: v.optional(v.string()),
        borderRadius: v.optional(v.string()),
        fontFamily: v.optional(v.string()),

        // Legacy/Other Fields
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
    brand: v.optional(
      v.object({
        bubbleColor: v.optional(v.string()),
        bubbleIcon: v.optional(v.string()),
        panelColor: v.optional(v.string()),
        headerTitle: v.optional(v.string()),
        welcomeMessage: v.optional(v.string()),
        position: v.optional(v.union(v.literal("left"), v.literal("right"))),
      })
    ),
    config: v.optional(
      v.object({
        webhookSecret: v.optional(v.string()),
        defaultLanguage: v.optional(v.union(v.literal("EN"), v.literal("ES"))),
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),
});
```

- [ ] **Step 2: Update `convex/widgets.ts` to include default values for new fields**

(Note: Ensure `create` and `update` mutations accept the new `theme` object properties. You may need to inspect `convex/widgets.ts` to see how it's currently structured and add the fields there as well if it uses strict validation).

- [ ] **Step 3: Commit**

```bash
git add convex/schema.ts convex/widgets.ts
git commit -m "feat: expand widget schema with content and design fields"
```

### Task 2: Implement the Hub (`/admin/widget`)

**Files:**
- Modify: `src/app/admin/widget/page.tsx`
- Delete: `src/app/admin/widget/create/page.tsx`

- [ ] **Step 1: Update the Hub to create a widget on click**

Replace the `<Link>` on the "Deploy New Node" button with an `onClick` handler that calls `api.widgets.create` with default values and redirects to the new widget's studio.

```tsx
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// Inside WidgetsPage component:
const createWidget = useMutation(api.widgets.create);
const router = useRouter();
const [isCreating, setIsCreating] = useState(false);

const handleCreate = async () => {
  if (!user) return;
  setIsCreating(true);
  try {
    // You may need to fetch the first project ID here, or let the user select it later.
    // For now, pass a dummy or require them to have a project. 
    // Let's assume the user has a project.
    // IMPORTANT: Adjust this based on how your `widgets.create` mutation expects `projectId`.
    // If it requires a valid project ID, you must fetch `projects` first.
    const newWidgetId = await createWidget({
      name: "New Widget",
      projectId: projects?.[0]?._id || "temp", // Handle appropriately
      type: "text",
      webhookUrl: "",
      allowedDomains: [],
      userId: user.id,
      theme: {
        accentColor: "#e4ff04",
        headerTextColor: "#ffffff",
        chatBackgroundColor: "#18181b",
        botBubbleBgColor: "#27272a",
        botTextColor: "#e5e5e5",
        userTextColor: "#ffffff",
        inputBgColor: "#27272a",
        inputTextColor: "#e5e5e5",
        inputBorderColor: "#3f3f46",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      }
    });
    router.push(`/admin/widget/${newWidgetId}`);
  } catch (err) {
    console.error(err);
    setIsCreating(false);
  }
};

// Update the button:
<Button 
  onClick={handleCreate} 
  disabled={isCreating || !projects || projects.length === 0}
  className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20"
>
  {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
  Deploy New Node
</Button>
```

- [ ] **Step 2: Delete redundant create page**

```bash
rm -rf src/app/admin/widget/create
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/widget/page.tsx
git rm -r src/app/admin/widget/create
git commit -m "feat: refactor hub to create and redirect to studio"
```

### Task 3: Build the Studio Editor (`/admin/widget/[widgetId]`)

**Files:**
- Modify: `src/app/admin/widget/[widgetId]/page.tsx`
- Delete: `src/app/admin/theming/[widgetId]/page.tsx`

- [ ] **Step 1: Replace `EditWidgetPage` with the new tabbed structure**

Implement the "Content", "Design", and "Embed" tabs matching the screenshots. Use standard React Hook Form + Zod for state management.

```tsx
// Ensure you have these tabs:
<TabsList className="w-full grid grid-cols-3">
  <TabsTrigger value="content"><Type className="w-4 h-4 mr-2" /> Content</TabsTrigger>
  <TabsTrigger value="design"><Palette className="w-4 h-4 mr-2" /> Design</TabsTrigger>
  <TabsTrigger value="embed"><Code className="w-4 h-4 mr-2" /> Embed</TabsTrigger>
</TabsList>
```

- [ ] **Step 2: Add the specific fields for each tab**

**Content Tab:**
- Widget Title (Input)
- Header Subtitle (Input)
- Welcome Message (Input)
- Placeholder Text (Input)
- Bot Name (Input)
- Show Branding (Switch)

**Design Tab (with ColorPickers and Inputs):**
- Accent Color
- Header Text
- Chat Background
- Bot Bubble BG
- Bot Text
- User Text
- Input BG
- Input Text
- Input Border
- Border Radius (Input, e.g., '12px')
- Font Family (Input, e.g., 'Inter, sans-serif')

**Embed Tab:**
- API Key (Display Widget ID with copy button)
- Script Tag (Display `<script>` tag with copy button)
- iFrame Embed (Display `<iframe>` tag with copy button)

- [ ] **Step 3: Delete redundant theming page**

```bash
rm -rf src/app/admin/theming
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/widget/[widgetId]/page.tsx
git rm -r src/app/admin/theming
git commit -m "feat: implement unified studio with content, design, and embed tabs"
```
