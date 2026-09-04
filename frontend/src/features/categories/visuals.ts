import {
  Bike,
  BookOpen,
  Briefcase,
  Car,
  CreditCard,
  FileText,
  Gift,
  Heart,
  Home,
  Plane,
  ShoppingCart,
  Ticket,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'

import type { CategoryColor } from '../../gql/graphql'

export const categoryIcons = {
  briefcase: Briefcase,
  car: Car,
  heart: Heart,
  utensils: UtensilsCrossed,
  cart: ShoppingCart,
  ticket: Ticket,
  gift: Gift,
  bike: Bike,
  home: Home,
  zap: Zap,
  book: BookOpen,
  plane: Plane,
  card: CreditCard,
  file: FileText,
} as const

export type CategoryIconName = keyof typeof categoryIcons

export const categoryIconNames = Object.keys(categoryIcons) as CategoryIconName[]

export function isCategoryIconName(value: string): value is CategoryIconName {
  return value in categoryIcons
}

type ColorClasses = { bg: string; text: string; dot: string }

export const categoryColorClasses: Record<CategoryColor, ColorClasses> = {
  BLUE: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-600' },
  PURPLE: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-600' },
  PINK: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-600' },
  RED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-600' },
  ORANGE: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-600' },
  YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-600' },
  GREEN: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-600' },
}

export const categoryColors = Object.keys(categoryColorClasses) as CategoryColor[]
