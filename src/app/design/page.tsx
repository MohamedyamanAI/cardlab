"use client"

import * as React from "react"
import { useRef } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Android } from "@/components/magicui/android"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern"
import { AnimatedList, AnimatedListItem } from "@/components/magicui/animated-list"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { AuroraText } from "@/components/magicui/aurora-text"
import { AvatarCircles } from "@/components/magicui/avatar-circles"
import { Badge } from "@/components/ui/badge"
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { ConfettiButton } from "@/components/magicui/confetti"
import { CoolMode } from "@/components/magicui/cool-mode"
import { Dock, DockIcon } from "@/components/magicui/dock"
import { DotPattern } from "@/components/magicui/dot-pattern"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { File, Folder, Tree, type TreeViewElement } from "@/components/magicui/file-tree"
import { FlickeringGrid } from "@/components/magicui/flickering-grid"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { HyperText } from "@/components/magicui/hyper-text"
import { Iphone } from "@/components/magicui/iphone"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { Label } from "@/components/ui/label"
import { LineShadowText } from "@/components/magicui/line-shadow-text"
import { MagicCard } from "@/components/magicui/magic-card"
import { Marquee } from "@/components/magicui/marquee"
import { Meteors } from "@/components/magicui/meteors"
import { MorphingText } from "@/components/magicui/morphing-text"
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { Particles } from "@/components/magicui/particles"
import { PulsatingButton } from "@/components/magicui/pulsating-button"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { RetroGrid } from "@/components/magicui/retro-grid"
import { Ripple } from "@/components/magicui/ripple"
import { RippleButton } from "@/components/magicui/ripple-button"
import { Safari } from "@/components/magicui/safari"
import { ScrollProgress } from "@/components/magicui/scroll-progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { ShineBorder } from "@/components/magicui/shine-border"
import { ShinyButton } from "@/components/magicui/shiny-button"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { SpinningText } from "@/components/magicui/spinning-text"
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/magicui/terminal"
import { TextAnimate } from "@/components/magicui/text-animate"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TypingAnimation as TypingAnimationText } from "@/components/magicui/typing-animation"
import { WarpBackground } from "@/components/magicui/warp-background"
import { WordRotate } from "@/components/magicui/word-rotate"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  BluetoothIcon,
  SearchIcon,
  MailIcon,
  UserIcon,
  SettingsIcon,
  Delete01Icon,
  EyeIcon,
  LinkIcon,
  ArrowRight01Icon,
  MoreVerticalCircle01Icon,
  Home01Icon,
  Notification01Icon,
  Calendar01Icon,
  FolderOpenIcon,
  FileIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"

export default function DesignPage() {
  return (
    <div className="bg-background min-h-screen">
      <ScrollProgress />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Design System
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            All available UI components
          </p>
        </div>

        <Tabs defaultValue="shadcn">
          <TabsList>
            <TabsTrigger value="shadcn">shadcn/ui</TabsTrigger>
            <TabsTrigger value="magicui">Magic UI</TabsTrigger>
          </TabsList>

          <TabsContent value="shadcn">
            <div className="space-y-16 pt-8">
              <ButtonsSection />
              <BadgesSection />
              <CardSection />
              <InputSection />
              <TextareaSection />
              <InputGroupSection />
              <SelectSection />
              <ComboboxSection />
              <LabelSection />
              <FieldSection />
              <SeparatorSection />
              <DropdownMenuSection />
              <AlertDialogSection />
            </div>
          </TabsContent>

          <TabsContent value="magicui">
            <div className="space-y-16 pt-8">
              <MagicButtonsSection />
              <TextAnimationsSection />
              <SpecialEffectsSection />
              <BackgroundsSection />
              <ComponentsSection />
              <DeviceMocksSection />
              <AnimationsSection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-foreground text-xl font-semibold">{children}</h2>
      <Separator className="mt-3" />
    </div>
  )
}

// ─── Original shadcn Components ──────────────────────────────────────────────

function ButtonsSection() {
  return (
    <section>
      <SectionTitle>Button</SectionTitle>
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Variants</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Sizes</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Icon Sizes</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="icon-xs">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            </Button>
            <Button size="icon-sm">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            </Button>
            <Button size="icon">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            </Button>
            <Button size="icon-lg">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            </Button>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">With Icons</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <HugeiconsIcon icon={MailIcon} strokeWidth={2} data-icon="inline-start" />
              Send Email
            </Button>
            <Button variant="outline">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
              Create New
            </Button>
            <Button variant="destructive">
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} data-icon="inline-start" />
              Delete
            </Button>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Disabled</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function BadgesSection() {
  return (
    <section>
      <SectionTitle>Badge</SectionTitle>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="link">Link</Badge>
      </div>
    </section>
  )
}

function CardSection() {
  return (
    <section>
      <SectionTitle>Card</SectionTitle>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>A simple card with header and content.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              This is the card content area. You can place any content here.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card with Action</CardTitle>
            <CardDescription>This card has a header action button.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon-sm">
                <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              The CardAction component positions an action in the top-right corner of the header.
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <Badge variant="secondary">Status</Badge>
            <Button variant="outline" size="sm">
              View
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </CardFooter>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Small Card</CardTitle>
            <CardDescription>size=&quot;sm&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Compact card variant with less padding.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function InputSection() {
  return (
    <section>
      <SectionTitle>Input</SectionTitle>
      <div className="max-w-md space-y-4">
        <Input placeholder="Default input" />
        <Input type="email" placeholder="Email input" />
        <Input type="password" placeholder="Password input" />
        <Input disabled placeholder="Disabled input" />
        <Input aria-invalid="true" defaultValue="Invalid input" />
      </div>
    </section>
  )
}

function TextareaSection() {
  return (
    <section>
      <SectionTitle>Textarea</SectionTitle>
      <div className="max-w-md space-y-4">
        <Textarea placeholder="Write something..." />
        <Textarea disabled placeholder="Disabled textarea" />
      </div>
    </section>
  )
}

function InputGroupSection() {
  return (
    <section>
      <SectionTitle>Input Group</SectionTitle>
      <div className="max-w-md space-y-4">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search..." />
        </InputGroup>

        <InputGroup>
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={MailIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Email address" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
        </InputGroup>

        <InputGroup>
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={LinkIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Enter URL" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="ghost" size="icon-xs">
              <HugeiconsIcon icon={EyeIcon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  )
}

function SelectSection() {
  return (
    <section>
      <SectionTitle>Select</SectionTitle>
      <div className="max-w-md space-y-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
              <SelectItem value="spinach">Spinach</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Small select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
            <SelectItem value="c">Option C</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  )
}

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
  "Gatsby",
  "Vite",
] as const

function ComboboxSection() {
  return (
    <section>
      <SectionTitle>Combobox</SectionTitle>
      <div className="max-w-md space-y-4">
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Search frameworks..." />
          <ComboboxContent>
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </section>
  )
}

function LabelSection() {
  return (
    <section>
      <SectionTitle>Label</SectionTitle>
      <div className="max-w-md space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="label-demo">Email Address</Label>
          <Input id="label-demo" type="email" placeholder="you@example.com" />
        </div>
      </div>
    </section>
  )
}

function FieldSection() {
  return (
    <section>
      <SectionTitle>Field</SectionTitle>
      <div className="max-w-md space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-name">Name</FieldLabel>
            <Input id="field-name" placeholder="Enter your name" />
            <FieldDescription>Your full legal name.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="field-email">Email</FieldLabel>
            <Input id="field-email" type="email" placeholder="you@example.com" />
            <FieldError errors={[{ message: "Please enter a valid email address." }]} />
          </Field>

          <Field orientation="horizontal">
            <FieldLabel>Horizontal Layout</FieldLabel>
            <Input placeholder="Side by side" />
          </Field>
        </FieldGroup>
      </div>
    </section>
  )
}

function SeparatorSection() {
  return (
    <section>
      <SectionTitle>Separator</SectionTitle>
      <div className="max-w-md space-y-6">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">Horizontal</p>
          <div className="space-y-3">
            <p className="text-sm">Content above</p>
            <Separator />
            <p className="text-sm">Content below</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">Vertical</p>
          <div className="flex h-8 items-center gap-3">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Center</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Right</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function DropdownMenuSection() {
  const [showStatusBar, setShowStatusBar] = React.useState(true)
  const [showPanel, setShowPanel] = React.useState(false)
  const [theme, setTheme] = React.useState("system")

  return (
    <section>
      <SectionTitle>Dropdown Menu</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Open Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                Settings
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={(checked) => setShowStatusBar(checked === true)}
              >
                Show Status Bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={(checked) => setShowPanel(checked === true)}
              >
                Show Panel
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  )
}

function AlertDialogSection() {
  return (
    <section>
      <SectionTitle>Alert Dialog</SectionTitle>
      <div className="flex flex-wrap gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Default Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Small with Media</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <HugeiconsIcon icon={BluetoothIcon} strokeWidth={2} />
              </AlertDialogMedia>
              <AlertDialogTitle>Allow connection?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to allow this device to connect?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Deny</AlertDialogCancel>
              <AlertDialogAction>Allow</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Destructive Action</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all items?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all items from your collection.
                This action cannot be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Items</AlertDialogCancel>
              <AlertDialogAction variant="destructive">
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}

// ─── Magic UI: Buttons ───────────────────────────────────────────────────────

function MagicButtonsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Buttons</SectionTitle>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <ShimmerButton>Shimmer Button</ShimmerButton>
          <ShinyButton>Shiny Button</ShinyButton>
          <RainbowButton>Rainbow Button</RainbowButton>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <InteractiveHoverButton>Hover Me</InteractiveHoverButton>
          <PulsatingButton>Pulsating</PulsatingButton>
          <RippleButton>Ripple Click</RippleButton>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CoolMode>
            <Button variant="outline">Cool Mode (click & drag)</Button>
          </CoolMode>
          <ConfettiButton>Confetti!</ConfettiButton>
        </div>
      </div>
    </section>
  )
}

// ─── Magic UI: Text Animations ───────────────────────────────────────────────

function TextAnimationsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Text Animations</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">TextAnimate</p>
          <div className="space-y-3">
            <TextAnimate animation="blurInUp" by="word" className="text-2xl font-bold">
              Blur in up by word
            </TextAnimate>
            <TextAnimate animation="slideUp" by="character" className="text-lg">
              Slide up by character
            </TextAnimate>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Aurora Text</p>
          <h2 className="text-4xl font-bold tracking-tighter">
            Ship <AuroraText>beautiful</AuroraText> products
          </h2>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Line Shadow Text</p>
          <LineShadowText className="text-4xl font-bold italic" shadowColor="oklch(0.556 0 0)">
            Shadow Text
          </LineShadowText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Number Ticker</p>
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-sm">Revenue:</span>
            <span className="text-4xl font-bold">
              $<NumberTicker value={9847} />
            </span>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Shiny Text</p>
          <AnimatedShinyText className="text-lg">
            Shiny text that catches your eye
          </AnimatedShinyText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Gradient Text</p>
          <AnimatedGradientText className="text-lg">
            Gradient animated text
          </AnimatedGradientText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Typing Animation</p>
          <TypingAnimationText className="text-2xl font-bold">
            This text types itself out...
          </TypingAnimationText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Word Rotate</p>
          <div className="flex items-center text-2xl font-bold">
            Build&nbsp;
            <WordRotate words={["amazing", "beautiful", "powerful", "modern"]} className="text-primary" />
            &nbsp;apps
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Sparkles Text</p>
          <SparklesText className="text-3xl">Magic Sparkles</SparklesText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">HyperText</p>
          <HyperText className="text-2xl font-bold">HYPER TEXT</HyperText>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Morphing Text</p>
          <MorphingText
            texts={["Hello", "World", "Magic", "Design"]}
            className="text-4xl font-bold"
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Spinning Text</p>
          <div className="flex h-32 items-center justify-center">
            <SpinningText className="text-sm" radius={4}>
              {`magic ui design system - `}
            </SpinningText>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Magic UI: Special Effects ───────────────────────────────────────────────

function SpecialEffectsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Special Effects</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Border Beam</p>
          <div className="bg-card relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="text-muted-foreground text-sm">Border Beam travels around me</span>
            <BorderBeam duration={6} size={150} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Magic Card</p>
          <div className="grid gap-4 md:grid-cols-2">
            <MagicCard className="p-6">
              <h3 className="text-lg font-semibold">Magic Card</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Hover to see the spotlight effect follow your cursor.
              </p>
            </MagicCard>
            <MagicCard className="p-6" gradientFrom="#FF6B6B" gradientTo="#4ECDC4">
              <h3 className="text-lg font-semibold">Custom Colors</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                With custom gradient colors on hover.
              </p>
            </MagicCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Shine Border</p>
          <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="text-muted-foreground text-sm">Shining border effect</span>
            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Neon Gradient Card</p>
          <div className="max-w-md">
            <NeonGradientCard>
              <h3 className="text-lg font-semibold">Neon Glow</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                This card has a beautiful neon gradient glow effect around its border.
              </p>
            </NeonGradientCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Meteors</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-black">
            <span className="z-10 text-sm text-white">Meteor shower</span>
            <Meteors number={15} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Particles</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="z-10 text-sm">Particle field (move mouse)</span>
            <Particles className="absolute inset-0" quantity={80} color="#8b5cf6" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Magic UI: Backgrounds ───────────────────────────────────────────────────

function BackgroundsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Backgrounds</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Retro Grid</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Retro Grid</span>
            <RetroGrid />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Dot Pattern</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Dot Pattern</span>
            <DotPattern className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Grid Pattern</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Grid Pattern</span>
            <GridPattern
              width={30}
              height={30}
              className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Grid Pattern</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Animated Grid</span>
            <AnimatedGridPattern
              numSquares={30}
              maxOpacity={0.3}
              duration={3}
              className="[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Interactive Grid Pattern</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Hover the grid</span>
            <InteractiveGridPattern
              width={30}
              height={30}
              className="absolute inset-0 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Flickering Grid</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Flickering Grid</span>
            <FlickeringGrid
              className="absolute inset-0 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
              squareSize={4}
              gridGap={6}
              color="#6B21A8"
              maxOpacity={0.5}
              flickerChance={0.1}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Ripple</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border">
            <span className="pointer-events-none z-10 text-sm font-medium">Ripple</span>
            <Ripple />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Warp Background</p>
          <WarpBackground className="max-w-lg" beamsPerSide={3}>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Warp Speed</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                A time-warping background effect
              </p>
            </div>
          </WarpBackground>
        </div>
      </div>
    </section>
  )
}

// ─── Magic UI: Components ────────────────────────────────────────────────────

const notifications = [
  { name: "Payment received", description: "$2,400 from John Doe", time: "2m ago", icon: "💰" },
  { name: "New user signed up", description: "jane@example.com", time: "5m ago", icon: "👤" },
  { name: "Bug report", description: "Fix login issue #423", time: "10m ago", icon: "🐛" },
  { name: "Deployment", description: "v2.4.0 deployed to prod", time: "15m ago", icon: "🚀" },
  { name: "Comment", description: "Great work on the PR!", time: "30m ago", icon: "💬" },
]

const marqueeReviews = [
  { name: "Alice", body: "This product is incredible. It changed my workflow completely." },
  { name: "Bob", body: "The best tool I've used in years. Highly recommended!" },
  { name: "Charlie", body: "Clean design and great performance. Love it." },
  { name: "Diana", body: "Support team is amazing. Fast and helpful." },
  { name: "Edward", body: "Worth every penny. Will buy again!" },
  { name: "Fiona", body: "The features are exactly what I needed." },
]

function ReviewCard({ name, body }: { name: string; body: string }) {
  return (
    <figure className="bg-card relative w-64 shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
          {name[0]}
        </div>
        <figcaption className="text-sm font-medium">{name}</figcaption>
      </div>
      <blockquote className="text-muted-foreground mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}

function NotificationItem({ name, description, time, icon }: typeof notifications[number]) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-3 shadow-sm">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <span className="text-muted-foreground text-xs">{time}</span>
    </div>
  )
}

function ComponentsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Components</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Marquee</p>
          <div className="overflow-hidden rounded-xl border">
            <Marquee pauseOnHover>
              {marqueeReviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.name} {...review} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover>
              {marqueeReviews.slice(3).map((review) => (
                <ReviewCard key={review.name} {...review} />
              ))}
            </Marquee>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Terminal</p>
          <Terminal>
            <TypingAnimation>&gt; pnpm dlx shadcn@latest init</TypingAnimation>
            <AnimatedSpan delay={1500} className="text-green-500">
              <span>&#10003; Preflight checks passed.</span>
            </AnimatedSpan>
            <AnimatedSpan delay={2000} className="text-green-500">
              <span>&#10003; Created components.json</span>
            </AnimatedSpan>
            <AnimatedSpan delay={2500} className="text-green-500">
              <span>&#10003; Initialized project.</span>
            </AnimatedSpan>
            <AnimatedSpan delay={3000} className="text-blue-500">
              <span>ℹ You may now start adding components.</span>
            </AnimatedSpan>
          </Terminal>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated List</p>
          <div className="max-w-md">
            <AnimatedList delay={1500}>
              {notifications.map((item) => (
                <NotificationItem key={item.name} {...item} />
              ))}
            </AnimatedList>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Dock</p>
          <Dock>
            <DockIcon>
              <HugeiconsIcon icon={Home01Icon} strokeWidth={2} className="size-6" />
            </DockIcon>
            <DockIcon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-6" />
            </DockIcon>
            <DockIcon>
              <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-6" />
            </DockIcon>
            <DockIcon>
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-6" />
            </DockIcon>
            <DockIcon>
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} className="size-6" />
            </DockIcon>
            <DockIcon>
              <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="size-6" />
            </DockIcon>
          </Dock>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Orbiting Circles</p>
          <div className="relative flex h-64 w-full items-center justify-center overflow-hidden">
            <span className="pointer-events-none z-10 text-sm font-medium">Orbit</span>
            <OrbitingCircles radius={80} iconSize={30}>
              <HugeiconsIcon icon={Home01Icon} strokeWidth={2} className="size-5" />
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-5" />
              <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-5" />
              <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className="size-5" />
            </OrbitingCircles>
            <OrbitingCircles radius={130} iconSize={30} reverse speed={0.5}>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-5" />
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-5" />
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} className="size-5" />
            </OrbitingCircles>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Circular Progress Bar</p>
          <div className="flex flex-wrap items-center gap-8">
            <AnimatedCircularProgressBar
              value={72}
              gaugePrimaryColor="oklch(0.541 0.281 293.009)"
              gaugeSecondaryColor="oklch(0.922 0 0)"
            />
            <AnimatedCircularProgressBar
              value={95}
              gaugePrimaryColor="oklch(0.65 0.2 145)"
              gaugeSecondaryColor="oklch(0.922 0 0)"
            />
            <AnimatedCircularProgressBar
              value={38}
              gaugePrimaryColor="oklch(0.65 0.2 25)"
              gaugeSecondaryColor="oklch(0.922 0 0)"
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Avatar Circles</p>
          <AvatarCircles
            numPeople={99}
            avatarUrls={[
              { imageUrl: "https://avatars.githubusercontent.com/u/16860528", profileUrl: "#" },
              { imageUrl: "https://avatars.githubusercontent.com/u/20110627", profileUrl: "#" },
              { imageUrl: "https://avatars.githubusercontent.com/u/106103625", profileUrl: "#" },
              { imageUrl: "https://avatars.githubusercontent.com/u/59228569", profileUrl: "#" },
            ]}
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Beam</p>
          <AnimatedBeamDemo />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">File Tree</p>
          <div className="max-w-xs rounded-xl border p-2">
            <Tree initialExpandedItems={["src", "components"]} className="h-60">
              <Folder element="src" value="src">
                <Folder element="components" value="components">
                  <Folder element="ui" value="ui">
                    <File value="button.tsx">
                      <span>button.tsx</span>
                    </File>
                    <File value="card.tsx">
                      <span>card.tsx</span>
                    </File>
                    <File value="input.tsx">
                      <span>input.tsx</span>
                    </File>
                  </Folder>
                  <Folder element="magicui" value="magicui">
                    <File value="magic-card.tsx">
                      <span>magic-card.tsx</span>
                    </File>
                    <File value="particles.tsx">
                      <span>particles.tsx</span>
                    </File>
                  </Folder>
                </Folder>
                <File value="app.tsx">
                  <span>app.tsx</span>
                </File>
                <File value="index.ts">
                  <span>index.ts</span>
                </File>
              </Folder>
            </Tree>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Bento Grid</p>
          <BentoGrid className="auto-rows-[12rem] grid-cols-1 md:grid-cols-3">
            <BentoCard
              name="Notifications"
              className="md:col-span-2"
              description="Get notified when something happens."
              Icon={({ className }: { className?: string }) => (
                <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} className={className} />
              )}
              href="#"
              cta="Learn more"
              background={<div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />}
            />
            <BentoCard
              name="Search"
              className=""
              description="Search through all your files."
              Icon={({ className }: { className?: string }) => (
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className={className} />
              )}
              href="#"
              cta="Learn more"
              background={<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />}
            />
            <BentoCard
              name="Settings"
              className=""
              description="Configure your preferences."
              Icon={({ className }: { className?: string }) => (
                <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} className={className} />
              )}
              href="#"
              cta="Learn more"
              background={<div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />}
            />
            <BentoCard
              name="Calendar"
              className="md:col-span-2"
              description="Schedule and manage your events."
              Icon={({ className }: { className?: string }) => (
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className={className} />
              )}
              href="#"
              cta="Learn more"
              background={<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />}
            />
          </BentoGrid>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Scroll Progress</p>
          <p className="text-muted-foreground text-sm">
            The gradient bar at the very top of this page is the ScrollProgress component &mdash; scroll to see it fill.
          </p>
        </div>
      </div>
    </section>
  )
}

function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex h-40 w-full max-w-lg items-center justify-between rounded-xl border p-10"
    >
      <div
        ref={fromRef}
        className="z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm"
      >
        <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-5" />
      </div>
      <div
        ref={toRef}
        className="z-10 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm"
      >
        <HugeiconsIcon icon={MailIcon} strokeWidth={2} className="size-5" />
      </div>
      <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} />
    </div>
  )
}

// ─── Magic UI: Device Mocks ─────────────────────────────────────────────────

function DeviceMocksSection() {
  return (
    <section>
      <SectionTitle>Magic UI Device Mocks</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Safari Browser</p>
          <Safari url="cardlab.design" className="max-w-2xl" />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">iPhone &amp; Android</p>
          <div className="flex flex-wrap items-start justify-center gap-8">
            <div className="w-48">
              <Iphone />
            </div>
            <div className="w-48">
              <Android />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Magic UI: Animations ────────────────────────────────────────────────────

function AnimationsSection() {
  return (
    <section>
      <SectionTitle>Magic UI Animations</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Blur Fade</p>
          <div className="space-y-4">
            <BlurFade delay={0.1}>
              <div className="bg-card rounded-lg border p-4">
                <p className="text-sm">First item fades in</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.3}>
              <div className="bg-card rounded-lg border p-4">
                <p className="text-sm">Second item fades in with delay</p>
              </div>
            </BlurFade>
            <BlurFade delay={0.5}>
              <div className="bg-card rounded-lg border p-4">
                <p className="text-sm">Third item fades in with more delay</p>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  )
}
