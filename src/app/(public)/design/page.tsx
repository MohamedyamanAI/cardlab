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
// Aceternity UI Components
import { BackgroundBeams } from "@/components/aceternity/background-beams"
import { BentoGrid as AcBentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid"
import { Timeline } from "@/components/aceternity/timeline"
import { LayoutGrid } from "@/components/aceternity/layout-grid"
import { HeroHighlight, Highlight } from "@/components/aceternity/hero-highlight"
import { AnimatedTooltip } from "@/components/aceternity/animated-tooltip"
import { FocusCards } from "@/components/aceternity/focus-cards"
import { TextRevealCard, TextRevealCardTitle, TextRevealCardDescription } from "@/components/aceternity/text-reveal-card"
import { FloatingDock as AcFloatingDock } from "@/components/aceternity/floating-dock"
import { Navbar as AcNavbar, NavBody, NavItems, NavbarLogo, NavbarButton } from "@/components/aceternity/resizable-navbar"
import { FileUpload } from "@/components/aceternity/file-upload"
import { Cover } from "@/components/aceternity/cover"
import { Tabs as AcTabs } from "@/components/aceternity/aceternity-tabs"
import { PlaceholdersAndVanishInput } from "@/components/aceternity/placeholders-and-vanish-input"
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect"
import { TextHoverEffect } from "@/components/aceternity/text-hover-effect"
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect"
import WorldMap from "@/components/aceternity/world-map"
import { SidebarProvider, Sidebar as AcSidebar, SidebarBody, SidebarLink } from "@/components/aceternity/sidebar"
import { LoaderOne, LoaderTwo, LoaderThree, LoaderFour, LoaderFive } from "@/components/aceternity/loader"
import { CardContainer, CardBody, CardItem } from "@/components/aceternity/3d-card"
import { PinContainer } from "@/components/aceternity/3d-pin"
import { ThreeDMarquee } from "@/components/aceternity/3d-marquee"
import { AnimatedTestimonials } from "@/components/aceternity/animated-testimonials"
import { Modal, ModalTrigger, ModalBody, ModalContent } from "@/components/aceternity/animated-modal"
import { Carousel as AcCarousel } from "@/components/aceternity/apple-cards-carousel"
import { Card as AppleCard } from "@/components/aceternity/apple-cards-carousel"
import { AuroraBackground } from "@/components/aceternity/aurora-background"
import { BackgroundBeamsWithCollision } from "@/components/aceternity/background-beams-with-collision"
import { BackgroundLines } from "@/components/aceternity/background-lines"
import { BoxesCore } from "@/components/aceternity/background-boxes"
import { BackgroundGradient } from "@/components/aceternity/background-gradient"
import { BackgroundGradientAnimation } from "@/components/aceternity/background-gradient-animation"
import { CanvasRevealEffect } from "@/components/aceternity/canvas-reveal-effect"
import { CardSpotlight } from "@/components/aceternity/card-spotlight"
import { CardStack } from "@/components/aceternity/card-stack"
import { HoverEffect } from "@/components/aceternity/card-hover-effect"
import AcCarouselComponent from "@/components/aceternity/carousel"
import { CodeBlock } from "@/components/aceternity/code-block"
import ColourfulText from "@/components/aceternity/colourful-text"
import { CometCard } from "@/components/aceternity/comet-card"
import { Compare } from "@/components/aceternity/compare"
import { ContainerTextFlip } from "@/components/aceternity/container-text-flip"
import { DirectionAwareHover } from "@/components/aceternity/direction-aware-hover"
import { DraggableCardBody, DraggableCardContainer } from "@/components/aceternity/draggable-card"
import { EncryptedText } from "@/components/aceternity/encrypted-text"
import { EvervaultCard } from "@/components/aceternity/evervault-card"
import { FlipWords } from "@/components/aceternity/flip-words"
import { FloatingNav } from "@/components/aceternity/floating-navbar"
import { FollowerPointerCard } from "@/components/aceternity/following-pointer"
import { GlareCard } from "@/components/aceternity/glare-card"
import { GlowingStarsBackgroundCard, GlowingStarsTitle, GlowingStarsDescription } from "@/components/aceternity/glowing-stars"
import { HeroParallax } from "@/components/aceternity/hero-parallax"
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient"
import { ImagesSlider } from "@/components/aceternity/images-slider"
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards"
import { LampContainer } from "@/components/aceternity/lamp"
import { LayoutTextFlip } from "@/components/aceternity/layout-text-flip"
import { Lens } from "@/components/aceternity/lens"
import { Button as MovingBorderButton } from "@/components/aceternity/moving-border"
import { Meteors as AcMeteors } from "@/components/aceternity/meteors"
import { ParallaxScroll } from "@/components/aceternity/parallax-scroll"
import { PointerHighlight } from "@/components/aceternity/pointer-highlight"
import { ShootingStars } from "@/components/aceternity/shooting-stars"
import { StarsBackground } from "@/components/aceternity/stars-background"
import { Spotlight } from "@/components/aceternity/spotlight"
import { Spotlight as SpotlightNew } from "@/components/aceternity/spotlight-new"
import { StickyScroll } from "@/components/aceternity/sticky-scroll-reveal"
import { MaskContainer } from "@/components/aceternity/svg-mask-effect"
import { TracingBeam } from "@/components/aceternity/tracing-beam"
import { Vortex } from "@/components/aceternity/vortex"
import { WavyBackground } from "@/components/aceternity/wavy-background"
import { WobbleCard } from "@/components/aceternity/wobble-card"
import { StickyBanner } from "@/components/aceternity/sticky-banner"
import { SparklesCore } from "@/components/aceternity/sparkles"
import { Input as AcInput } from "@/components/aceternity/aceternity-input"
import { Label as AcLabel } from "@/components/aceternity/aceternity-label"
import ExpandableCardDemoStandard from "@/components/aceternity/expandable-card-demo-standard"
import ExpandableCardDemoGrid from "@/components/aceternity/expandable-card-demo-grid"
import SignupFormDemo from "@/components/aceternity/signup-form-demo"
import HeroSectionOne from "@/components/aceternity/hero-section-demo-1"
import FeaturesSectionDemo1 from "@/components/aceternity/features-section-demo-1"
import FeaturesSectionDemo2 from "@/components/aceternity/features-section-demo-2"
import FeaturesSectionDemo3 from "@/components/aceternity/features-section-demo-3"
import {
  IconHome,
  IconUser,
  IconSettings,
  IconBrandGithub,
  IconSearch,
  IconMail,
  IconCalendar,
  IconBell,
} from "@tabler/icons-react"

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
            <TabsTrigger value="aceternity">Aceternity UI</TabsTrigger>
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

          <TabsContent value="aceternity">
            <div className="space-y-16 pt-8">
              <AcHeroSection />
              <AcFeatureSectionsSection />
              <AcTextEffectsSection />
              <AcBackgroundSection />
              <AcSparklesSection />
              <AcBackgroundsExtraSection />
              <AcLayoutSection />
              <AcCardsSection />
              <AcCardsExtraSection />
              <AcNavigationSection />
              <AcNavbarSection />
              <AcFormSection />
              <AcInputLabelSection />
              <AcContainerSection />
              <AcEffectsSection />
              <AcModalsOverlaysSection />
              <AcScrollSection />
              <AcLoadersSection />
              <AcWorldMapSection />
              <AcSidebarSection />
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

// ─── Aceternity UI: Text Effects ──────────────────────────────────────────────

function AcTextEffectsSection() {
  return (
    <section>
      <SectionTitle>Aceternity Text Effects</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Text Generate Effect</p>
          <TextGenerateEffect words="The quick brown fox jumps over the lazy dog. This text fades in word by word with a beautiful animation." />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Text Hover Effect</p>
          <div className="flex h-40 items-center justify-center">
            <TextHoverEffect text="ACETERNITY" />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Typewriter Effect</p>
          <div className="flex items-center justify-center py-4">
            <TypewriterEffect
              words={[
                { text: "Build" },
                { text: "amazing" },
                { text: "apps" },
                { text: "with" },
                { text: "Aceternity.", className: "text-blue-500 dark:text-blue-500" },
              ]}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Text Reveal Card</p>
          <TextRevealCard text="You know the business" revealText="I know the chemistry">
            <TextRevealCardTitle>Sometimes, you just need to see it.</TextRevealCardTitle>
            <TextRevealCardDescription>
              Hover over the card to reveal the hidden text.
            </TextRevealCardDescription>
          </TextRevealCard>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Cover</p>
          <h2 className="text-2xl font-bold">
            Build products at <Cover>warp speed</Cover>
          </h2>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Background ────────────────────────────────────────────────

function AcBackgroundSection() {
  return (
    <section>
      <SectionTitle>Aceternity Backgrounds</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Beams</p>
          <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-neutral-950 antialiased">
            <h3 className="relative z-10 text-lg font-bold text-white">Background Beams</h3>
            <p className="relative z-10 mt-1 max-w-sm text-center text-sm text-neutral-400">
              Animated beams create a beautiful background effect
            </p>
            <BackgroundBeams />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Hero Highlight</p>
          <HeroHighlight>
            <h3 className="mx-auto max-w-xl text-center text-2xl font-bold leading-relaxed">
              With this component, you can highlight{" "}
              <Highlight className="text-black dark:text-white">
                important text
              </Highlight>{" "}
              in your hero sections.
            </h3>
          </HeroHighlight>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Layout ────────────────────────────────────────────────────

function AcLayoutSection() {
  return (
    <section>
      <SectionTitle>Aceternity Layout</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Bento Grid</p>
          <AcBentoGrid>
            <BentoGridItem
              title="The Dawn of Innovation"
              description="Explore the birth of groundbreaking ideas and inventions."
              header={<div className="flex h-full min-h-24 w-full rounded-xl bg-gradient-to-br from-violet-500 to-purple-500" />}
              className="md:col-span-2"
            />
            <BentoGridItem
              title="The Digital Revolution"
              description="Dive into the transformative power of technology."
              header={<div className="flex h-full min-h-24 w-full rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500" />}
            />
            <BentoGridItem
              title="The Art of Design"
              description="Discover the beauty of thoughtful and functional design."
              header={<div className="flex h-full min-h-24 w-full rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500" />}
            />
            <BentoGridItem
              title="The Power of Communication"
              description="Understand the impact of effective communication."
              header={<div className="flex h-full min-h-24 w-full rounded-xl bg-gradient-to-br from-green-500 to-emerald-500" />}
              className="md:col-span-2"
            />
          </AcBentoGrid>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Timeline</p>
          <div className="relative max-w-2xl">
            <Timeline
              data={[
                {
                  title: "2024",
                  content: (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Launched the new design system with beautiful components and animations.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "2023",
                  content: (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Built the foundation with core UI components and dark mode support.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "2022",
                  content: (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Started the project with initial prototypes and research.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Tooltip</p>
          <div className="flex w-full items-center justify-center py-4">
            <AnimatedTooltip
              items={[
                { id: 1, name: "Alice", designation: "Developer", image: "https://avatars.githubusercontent.com/u/16860528" },
                { id: 2, name: "Bob", designation: "Designer", image: "https://avatars.githubusercontent.com/u/20110627" },
                { id: 3, name: "Charlie", designation: "Manager", image: "https://avatars.githubusercontent.com/u/106103625" },
                { id: 4, name: "Diana", designation: "Engineer", image: "https://avatars.githubusercontent.com/u/59228569" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Cards ─────────────────────────────────────────────────────

function AcCardsSection() {
  return (
    <section>
      <SectionTitle>Aceternity Cards</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">3D Card Effect</p>
          <div className="flex items-center justify-center">
            <CardContainer className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
                  Make things float in air
                </CardItem>
                <CardItem as="p" translateZ="60" className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300">
                  Hover over this card to unleash the power of CSS perspective
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <div className="h-40 w-full rounded-xl bg-gradient-to-br from-violet-500 to-purple-700" />
                </CardItem>
                <div className="flex justify-between items-center mt-6">
                  <CardItem translateZ={20} as="button" className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white">
                    Try now →
                  </CardItem>
                  <CardItem translateZ={20} as="button" className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold">
                    Sign up
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Focus Cards</p>
          <FocusCards
            cards={[
              { title: "Mountain Vista", src: "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=600" },
              { title: "Ocean Sunset", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600" },
              { title: "Forest Trail", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600" },
              { title: "City Lights", src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600" },
            ]}
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Expandable Cards (Standard)</p>
          <ExpandableCardDemoStandard />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Expandable Cards (Grid)</p>
          <ExpandableCardDemoGrid />
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Navigation ────────────────────────────────────────────────

function AcNavigationSection() {
  return (
    <section>
      <SectionTitle>Aceternity Navigation</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Floating Dock</p>
          <div className="flex items-center justify-center py-8">
            <AcFloatingDock
              items={[
                { title: "Home", icon: <IconHome className="size-full" />, href: "#" },
                { title: "Search", icon: <IconSearch className="size-full" />, href: "#" },
                { title: "Mail", icon: <IconMail className="size-full" />, href: "#" },
                { title: "Calendar", icon: <IconCalendar className="size-full" />, href: "#" },
                { title: "Settings", icon: <IconSettings className="size-full" />, href: "#" },
                { title: "GitHub", icon: <IconBrandGithub className="size-full" />, href: "#" },
              ]}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Tabs</p>
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border [perspective:1000px]">
            <AcTabs
              tabs={[
                {
                  title: "Product",
                  value: "product",
                  content: (
                    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-700 to-violet-900 p-6 text-white">
                      <p className="text-lg font-bold">Product Tab Content</p>
                    </div>
                  ),
                },
                {
                  title: "Services",
                  value: "services",
                  content: (
                    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 to-cyan-900 p-6 text-white">
                      <p className="text-lg font-bold">Services Tab Content</p>
                    </div>
                  ),
                },
                {
                  title: "Pricing",
                  value: "pricing",
                  content: (
                    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-green-700 to-emerald-900 p-6 text-white">
                      <p className="text-lg font-bold">Pricing Tab Content</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Forms ─────────────────────────────────────────────────────

function AcFormSection() {
  return (
    <section>
      <SectionTitle>Aceternity Forms</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Placeholders &amp; Vanish Input</p>
          <div className="mx-auto max-w-xl">
            <PlaceholdersAndVanishInput
              placeholders={[
                "What is your favorite framework?",
                "Search for components...",
                "Type something amazing...",
                "How can I help you today?",
              ]}
              onChange={() => {}}
              onSubmit={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">File Upload</p>
          <div className="mx-auto max-w-xl">
            <FileUpload onChange={() => {}} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Signup Form</p>
          <div className="mx-auto max-w-md">
            <SignupFormDemo />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Container ─────────────────────────────────────────────────

function AcContainerSection() {
  return (
    <section>
      <SectionTitle>Aceternity Container</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Layout Grid</p>
          <LayoutGrid
            cards={[
              {
                id: 1,
                content: <p className="text-sm font-bold text-white">Mountain Peak</p>,
                className: "md:col-span-2",
                thumbnail: "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=600",
              },
              {
                id: 2,
                content: <p className="text-sm font-bold text-white">Ocean Waves</p>,
                className: "col-span-1",
                thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
              },
              {
                id: 3,
                content: <p className="text-sm font-bold text-white">Deep Forest</p>,
                className: "col-span-1",
                thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600",
              },
              {
                id: 4,
                content: <p className="text-sm font-bold text-white">Night City</p>,
                className: "md:col-span-2",
                thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600",
              },
            ]}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Loaders ───────────────────────────────────────────────────

function AcLoadersSection() {
  return (
    <section>
      <SectionTitle>Aceternity Loaders</SectionTitle>
      <div className="flex flex-wrap items-center justify-center gap-12 py-8">
        <div className="flex flex-col items-center gap-3">
          <LoaderOne />
          <p className="text-muted-foreground text-xs">Loader One</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoaderTwo />
          <p className="text-muted-foreground text-xs">Loader Two</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoaderThree />
          <p className="text-muted-foreground text-xs">Loader Three</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoaderFour />
          <p className="text-muted-foreground text-xs">Loader Four</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <LoaderFive text="Loading" />
          <p className="text-muted-foreground text-xs">Loader Five</p>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: World Map ─────────────────────────────────────────────────

function AcWorldMapSection() {
  return (
    <section>
      <SectionTitle>Aceternity World Map</SectionTitle>
      <div className="overflow-hidden rounded-xl border">
        <WorldMap
          dots={[
            { start: { lat: 40.7128, lng: -74.006 }, end: { lat: 51.5074, lng: -0.1278 } },
            { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: -33.8688, lng: 151.2093 } },
            { start: { lat: 48.8566, lng: 2.3522 }, end: { lat: 22.3193, lng: 114.1694 } },
          ]}
          lineColor="#6366f1"
        />
      </div>
    </section>
  )
}

// ─── Aceternity UI: Sidebar ───────────────────────────────────────────────────

function AcSidebarSection() {
  return (
    <section>
      <SectionTitle>Aceternity Sidebar</SectionTitle>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border">
        <SidebarProvider>
          <div className="flex h-64">
            <AcSidebar>
              <SidebarBody className="justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <SidebarLink link={{ label: "Home", href: "#", icon: <IconHome className="size-5 shrink-0" /> }} />
                  <SidebarLink link={{ label: "Profile", href: "#", icon: <IconUser className="size-5 shrink-0" /> }} />
                  <SidebarLink link={{ label: "Settings", href: "#", icon: <IconSettings className="size-5 shrink-0" /> }} />
                  <SidebarLink link={{ label: "Notifications", href: "#", icon: <IconBell className="size-5 shrink-0" /> }} />
                </div>
              </SidebarBody>
            </AcSidebar>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground text-sm">Hover the sidebar to expand it</p>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Hero Section ──────────────────────────────────────────────

function AcHeroSection() {
  return (
    <section>
      <SectionTitle>Aceternity Hero Section</SectionTitle>
      <div className="overflow-hidden rounded-xl border">
        <HeroSectionOne />
      </div>
    </section>
  )
}

// ─── Aceternity UI: Feature Sections ──────────────────────────────────────────

function AcFeatureSectionsSection() {
  return (
    <section>
      <SectionTitle>Aceternity Feature Sections</SectionTitle>
      <div className="space-y-12">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Feature Section — Variant 1</p>
          <div className="overflow-hidden rounded-xl border">
            <FeaturesSectionDemo1 />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Feature Section — Variant 2</p>
          <div className="overflow-hidden rounded-xl border">
            <FeaturesSectionDemo2 />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Feature Section — Variant 3</p>
          <div className="overflow-hidden rounded-xl border">
            <FeaturesSectionDemo3 />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Sparkles ──────────────────────────────────────────────────

function AcSparklesSection() {
  return (
    <section>
      <SectionTitle>Aceternity Sparkles</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Sparkles Core</p>
          <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-black">
            <h3 className="relative z-10 text-center text-2xl font-bold text-white">
              Sparkle Effect
            </h3>
            <div className="relative h-24 w-full">
              <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={120}
                className="h-full w-full"
                particleColor="#FFFFFF"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Custom Colors</p>
          <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-neutral-950">
            <SparklesCore
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={80}
              className="absolute inset-0 h-full w-full"
              particleColor="#ff6b6b"
              speed={2}
            />
            <p className="relative z-10 text-sm font-medium text-white">Red sparkles with custom speed</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Resizable Navbar ──────────────────────────────────────────

function AcNavbarSection() {
  return (
    <section>
      <SectionTitle>Aceternity Resizable Navbar</SectionTitle>
      <div className="relative h-64 overflow-hidden rounded-xl border">
        <AcNavbar className="relative top-2">
          <NavBody>
            <NavbarLogo />
            <NavItems
              items={[
                { name: "Home", link: "#" },
                { name: "About", link: "#" },
                { name: "Contact", link: "#" },
              ]}
            />
            <NavbarButton variant="primary">Get Started</NavbarButton>
          </NavBody>
        </AcNavbar>
        <div className="flex h-full items-center justify-center pt-16">
          <p className="text-muted-foreground text-sm">
            Scroll the page to see the navbar resize
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Animated Input & Label ────────────────────────────────────

function AcInputLabelSection() {
  return (
    <section>
      <SectionTitle>Aceternity Input &amp; Label</SectionTitle>
      <div className="mx-auto max-w-md space-y-6 rounded-xl border bg-neutral-950 p-8">
        <div className="space-y-2">
          <AcLabel htmlFor="ac-email">Email Address</AcLabel>
          <AcInput id="ac-email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <AcLabel htmlFor="ac-password">Password</AcLabel>
          <AcInput id="ac-password" type="password" placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <AcLabel htmlFor="ac-name">Full Name</AcLabel>
          <AcInput id="ac-name" type="text" placeholder="John Doe" />
        </div>
        <p className="text-center text-xs text-neutral-400">
          Hover the inputs to see the glow effect
        </p>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Extra Backgrounds ─────────────────────────────────────────

function AcBackgroundsExtraSection() {
  return (
    <section>
      <SectionTitle>Aceternity Backgrounds (More)</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Aurora Background</p>
          <AuroraBackground className="rounded-xl">
            <h3 className="relative z-10 text-center text-2xl font-bold text-white">
              Aurora Background
            </h3>
          </AuroraBackground>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Lines</p>
          <BackgroundLines className="flex h-48 items-center justify-center rounded-xl border">
            <h3 className="relative z-10 text-center text-2xl font-bold">
              Background Lines
            </h3>
          </BackgroundLines>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Beams with Collision</p>
          <BackgroundBeamsWithCollision className="rounded-xl">
            <h3 className="relative z-10 text-center text-2xl font-bold">
              Beams with Collision
            </h3>
          </BackgroundBeamsWithCollision>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Wavy Background</p>
          <WavyBackground className="flex h-48 items-center justify-center rounded-xl" waveOpacity={0.3}>
            <h3 className="relative z-10 text-center text-2xl font-bold text-white">
              Wavy Background
            </h3>
          </WavyBackground>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Vortex</p>
          <Vortex className="flex h-48 items-center justify-center rounded-xl" backgroundColor="black" rangeY={200} particleCount={500} baseHue={220}>
            <h3 className="relative z-10 text-center text-2xl font-bold text-white">Vortex Effect</h3>
          </Vortex>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Shooting Stars + Stars Background</p>
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950">
            <h3 className="relative z-10 text-center text-lg font-bold text-white">Starry Sky</h3>
            <ShootingStars />
            <StarsBackground />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Boxes</p>
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950">
            <h3 className="relative z-10 text-center text-lg font-bold text-white">Background Boxes</h3>
            <BoxesCore className="absolute inset-0" />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Lamp Effect</p>
          <LampContainer className="rounded-xl">
            <h3 className="text-center text-2xl font-bold text-white">
              Lamp Effect
            </h3>
          </LampContainer>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Spotlight</p>
          <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border bg-neutral-950">
            <Spotlight className="-top-20 left-0 md:-top-20 md:left-60" fill="white" />
            <h3 className="relative z-10 text-center text-2xl font-bold text-white">Spotlight</h3>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Gradient Animation</p>
          <BackgroundGradientAnimation className="rounded-xl">
            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
              <h3 className="text-center text-2xl font-bold text-white drop-shadow-2xl">Gradient Animation</h3>
            </div>
          </BackgroundGradientAnimation>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Extra Cards ───────────────────────────────────────────────

function AcCardsExtraSection() {
  return (
    <section>
      <SectionTitle>Aceternity Cards (More)</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Card Spotlight</p>
          <div className="grid gap-4 md:grid-cols-2">
            <CardSpotlight className="p-6">
              <h3 className="text-lg font-bold text-white">Card Spotlight</h3>
              <p className="mt-2 text-sm text-neutral-300">Hover to see the spotlight follow your cursor</p>
            </CardSpotlight>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Card Stack</p>
          <div className="flex items-center justify-center py-8">
            <CardStack
              items={[
                { id: 0, name: "Alice", designation: "Developer", content: "This is the best component library I have ever used." },
                { id: 1, name: "Bob", designation: "Designer", content: "The animations are silky smooth and beautiful." },
                { id: 2, name: "Charlie", designation: "Engineer", content: "Easy to integrate and customize for any project." },
              ]}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Glare Card</p>
          <div className="flex items-center justify-center">
            <GlareCard className="flex flex-col items-center justify-center p-8">
              <h3 className="text-lg font-bold text-white">Glare Card</h3>
              <p className="mt-2 text-center text-sm text-neutral-300">Move your cursor to see the glare effect</p>
            </GlareCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Evervault Card</p>
          <div className="flex items-center justify-center">
            <div className="relative mx-auto flex h-64 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border p-4">
              <EvervaultCard text="Aceternity" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Wobble Card</p>
          <div className="grid gap-4 md:grid-cols-2">
            <WobbleCard containerClassName="bg-indigo-800 min-h-[200px]">
              <h3 className="text-lg font-bold text-white">Wobble Card</h3>
              <p className="mt-2 text-sm text-neutral-200">Hover over me to see the wobble effect</p>
            </WobbleCard>
            <WobbleCard containerClassName="bg-pink-800 min-h-[200px]">
              <h3 className="text-lg font-bold text-white">Another Wobble</h3>
              <p className="mt-2 text-sm text-neutral-200">Each card wobbles independently</p>
            </WobbleCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Comet Card</p>
          <div className="flex items-center justify-center">
            <CometCard className="flex h-64 w-full max-w-sm flex-col items-center justify-center rounded-xl border bg-neutral-950 p-6">
              <h3 className="text-lg font-bold text-white">Comet Card</h3>
              <p className="mt-2 text-center text-sm text-neutral-400">Hover to see the comet trail effect</p>
            </CometCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Direction Aware Hover</p>
          <div className="flex items-center justify-center">
            <DirectionAwareHover imageUrl="https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=600">
              <p className="text-lg font-bold">Mountain Vista</p>
              <p className="text-sm text-neutral-300">Hover from any direction</p>
            </DirectionAwareHover>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Card Hover Effect</p>
          <HoverEffect
            items={[
              { title: "Project Alpha", description: "A description of the first project with hover animation", link: "#" },
              { title: "Project Beta", description: "A description of the second project with hover animation", link: "#" },
              { title: "Project Gamma", description: "A description of the third project with hover animation", link: "#" },
            ]}
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Glowing Stars Card</p>
          <div className="flex items-center justify-center">
            <GlowingStarsBackgroundCard className="max-w-md">
              <GlowingStarsTitle>Next.js Components</GlowingStarsTitle>
              <GlowingStarsDescription>
                Beautiful animated components built with Tailwind CSS and Framer Motion
              </GlowingStarsDescription>
            </GlowingStarsBackgroundCard>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Following Pointer</p>
          <FollowerPointerCard title="Aceternity UI" className="rounded-xl border p-8">
            <h3 className="text-lg font-semibold">Hover me</h3>
            <p className="text-muted-foreground mt-2 text-sm">The pointer follows your cursor with a custom label</p>
          </FollowerPointerCard>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">3D Pin</p>
          <div className="flex h-80 items-center justify-center">
            <PinContainer title="Visit" href="#">
              <div className="flex h-32 w-64 flex-col p-4">
                <h3 className="text-base font-bold text-white">3D Pin</h3>
                <p className="mt-2 text-sm text-neutral-400">Hover to see the 3D pinned effect</p>
              </div>
            </PinContainer>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Background Gradient (Card)</p>
          <div className="flex items-center justify-center">
            <BackgroundGradient className="max-w-sm rounded-[22px] bg-white p-4 dark:bg-zinc-900 sm:p-10">
              <h3 className="text-lg font-bold text-black dark:text-white">Gradient Border</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                This card has an animated gradient border effect
              </p>
            </BackgroundGradient>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Draggable Card</p>
          <DraggableCardContainer className="relative flex h-64 items-center justify-center overflow-hidden rounded-xl border">
            <DraggableCardBody className="rounded-xl bg-neutral-900 p-6">
              <h3 className="text-lg font-bold text-white">Drag me!</h3>
              <p className="mt-2 text-sm text-neutral-400">This card can be dragged around</p>
            </DraggableCardBody>
          </DraggableCardContainer>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Effects & Interactions ────────────────────────────────────

function AcEffectsSection() {
  return (
    <section>
      <SectionTitle>Aceternity Effects &amp; Interactions</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Colourful Text</p>
          <h2 className="text-3xl font-bold">
            Build with <ColourfulText text="Colourful Text" />
          </h2>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Encrypted Text</p>
          <div className="flex items-center justify-center py-4">
            <EncryptedText text="ACETERNITY UI" className="text-3xl font-bold" />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Flip Words</p>
          <div className="flex items-center justify-center py-4 text-2xl font-bold">
            Build <FlipWords words={["amazing", "beautiful", "modern", "powerful"]} /> websites
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Container Text Flip</p>
          <ContainerTextFlip words={["innovative", "beautiful", "powerful", "modern"]} />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Layout Text Flip</p>
          <LayoutTextFlip text="Build" words={["apps", "sites", "tools", "products"]} />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Moving Border</p>
          <div className="flex flex-wrap items-center gap-4">
            <MovingBorderButton borderRadius="1.75rem" className="bg-white text-black dark:bg-slate-900 dark:text-white">
              Moving Border
            </MovingBorderButton>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Hover Border Gradient</p>
          <div className="flex items-center justify-center">
            <HoverBorderGradient containerClassName="rounded-full" className="flex items-center space-x-2 bg-white text-black dark:bg-black dark:text-white">
              <span>Hover Border Gradient</span>
            </HoverBorderGradient>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Canvas Reveal Effect</p>
          <div className="flex items-center justify-center">
            <div className="flex h-48 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border bg-black">
              <CanvasRevealEffect animationSpeed={3} containerClassName="bg-black" colors={[[125, 211, 252]]} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">SVG Mask Effect</p>
          <MaskContainer
            revealText={<span className="mx-auto max-w-4xl text-center text-2xl font-bold text-slate-800">The first satisfsatisfying satisfying satisfying satisfying</span>}
            className="h-40 rounded-xl border"
          >
            The first satisfying satisfying satisfying <span className="text-red-500">satisfying</span> satisfying
          </MaskContainer>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Lens</p>
          <div className="flex items-center justify-center">
            <Lens>
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 p-8">
                <h3 className="text-xl font-bold text-white">Lens Effect</h3>
                <p className="mt-2 text-sm text-white/80">Hover to magnify the content underneath</p>
              </div>
            </Lens>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Pointer Highlight</p>
          <PointerHighlight containerClassName="rounded-xl border p-8">
            <h3 className="text-lg font-semibold">Pointer Highlight</h3>
            <p className="text-muted-foreground mt-2 text-sm">Hover to see the pointer highlight effect</p>
          </PointerHighlight>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Compare</p>
          <div className="flex items-center justify-center">
            <Compare
              firstImage="https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=600"
              secondImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
              className="h-64 w-full max-w-lg rounded-xl"
              slideMode="hover"
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Infinite Moving Cards</p>
          <InfiniteMovingCards
            items={[
              { quote: "This is the best component library I have ever used.", name: "Alice", title: "Developer" },
              { quote: "The animations are silky smooth and beautiful.", name: "Bob", title: "Designer" },
              { quote: "Easy to integrate and customize for any project.", name: "Charlie", title: "Engineer" },
              { quote: "Worth every penny. Will buy again!", name: "Diana", title: "Manager" },
            ]}
            direction="right"
            speed="slow"
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Testimonials</p>
          <AnimatedTestimonials
            testimonials={[
              { quote: "This library changed my workflow completely.", name: "Alice Johnson", designation: "Frontend Developer", src: "https://avatars.githubusercontent.com/u/16860528" },
              { quote: "Beautiful components with great animations.", name: "Bob Smith", designation: "UI Designer", src: "https://avatars.githubusercontent.com/u/20110627" },
              { quote: "The best tool for modern web development.", name: "Charlie Brown", designation: "Full Stack Engineer", src: "https://avatars.githubusercontent.com/u/106103625" },
            ]}
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Meteors</p>
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-neutral-950">
            <span className="z-10 text-sm text-white">Meteor shower</span>
            <AcMeteors number={15} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Code Block</p>
          <div className="mx-auto max-w-2xl">
            <CodeBlock
              language="tsx"
              filename="example.tsx"
              code={`import { Button } from "@/components/ui/button"\n\nexport function MyComponent() {\n  return <Button>Click me</Button>\n}`}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Images Slider</p>
          <ImagesSlider
            images={[
              "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=800",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            ]}
            className="h-64 rounded-xl"
          >
            <div className="z-50 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-white">Image Slider</p>
            </div>
          </ImagesSlider>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Parallax Scroll</p>
          <ParallaxScroll
            images={[
              "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=400",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
              "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
              "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=400",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
            ]}
            className="max-h-96"
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">3D Marquee</p>
          <ThreeDMarquee
            images={[
              "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=300",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300",
              "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300",
              "https://images.unsplash.com/photo-1518710843675-2540dd03d51b?w=300",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300",
              "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300",
            ]}
            className="rounded-xl"
          />
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Modals & Overlays ─────────────────────────────────────────

function AcModalsOverlaysSection() {
  return (
    <section>
      <SectionTitle>Aceternity Modals &amp; Overlays</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Animated Modal</p>
          <Modal>
            <ModalTrigger className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
              Open Modal
            </ModalTrigger>
            <ModalBody>
              <ModalContent>
                <h3 className="text-lg font-bold">Animated Modal</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  This modal animates in with a beautiful spring animation.
                </p>
              </ModalContent>
            </ModalBody>
          </Modal>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Sticky Banner</p>
          <div className="relative h-24 overflow-hidden rounded-xl border">
            <StickyBanner className="relative">
              This is a sticky banner — it stays at the top on scroll
            </StickyBanner>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Aceternity UI: Scroll Effects ────────────────────────────────────────────

function AcScrollSection() {
  return (
    <section>
      <SectionTitle>Aceternity Scroll Effects</SectionTitle>
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Sticky Scroll Reveal</p>
          <div className="max-h-[500px] overflow-y-auto rounded-xl border">
            <StickyScroll
              content={[
                { title: "Collaborative Editing", description: "Work together in real time with your team. See changes as they happen." },
                { title: "Real Time Changes", description: "Watch your project evolve in real time. No need to refresh." },
                { title: "Version Control", description: "Track every change and go back to any version at any time." },
                { title: "Running Out of Content", description: "Experience the sticky scroll effect as you read through." },
              ]}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 text-sm font-medium">Tracing Beam</p>
          <div className="max-h-96 overflow-y-auto rounded-xl border">
            <TracingBeam className="px-6">
              <div className="space-y-8 py-8">
                <div>
                  <h3 className="text-lg font-bold">Chapter 1</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    The tracing beam follows your scroll position, creating a beautiful reading indicator.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Chapter 2</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    As you scroll through this content, the beam traces your progress.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Chapter 3</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Beautiful scroll-linked animations make reading more engaging.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                </div>
              </div>
            </TracingBeam>
          </div>
        </div>
      </div>
    </section>
  )
}
