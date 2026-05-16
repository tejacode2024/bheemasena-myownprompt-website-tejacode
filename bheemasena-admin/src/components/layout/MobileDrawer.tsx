// The sidebar already collapses + slides into view via CSS classes on
// `.admin-sidebar.open` (see index.css). The Sidebar component renders its
// own backdrop overlay when `sidebarOpen` is true, so a separate drawer
// component is unnecessary — re-export here keeps the file in the project
// structure as documented.
export { Sidebar as MobileDrawer } from './Sidebar'
