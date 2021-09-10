import { ThemeImages, ThemeVariables } from '@/Theme/theme.type'

/**
 *
 * @param Theme can be spread like {Colors, NavigationColors, Gutters, Layout, Common, ...args}
 * @return {*}
 */
export default function ({}: ThemeVariables): ThemeImages {
  return {
    logo: require('@/Assets/Images/TOM.png'),
    photoLibrary: require('@/Assets/Images/video-file.png'),
    files: require('@/Assets/Images/movies-folder.png'),
    history: require('@/Assets/Images/order-history.png'),
    settings: require('@/Assets/Images/settings.png'),
    services: require('@/Assets/Images/services.gif'),
    checkmark: require('@/Assets/Images/checkmark.png'),
    crown: require('@/Assets/Images/crown.png'),
    error: require('@/Assets/Images/error.png'),
  }
}
