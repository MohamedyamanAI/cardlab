"use client"

import * as React from "react"

import { Example, ExampleWrapper } from "@/components/example"
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
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"
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
  StarIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons"

export default function DesignPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Design System
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            All available UI components
          </p>
        </div>

        <div className="space-y-16">
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
