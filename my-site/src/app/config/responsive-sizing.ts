
export const responsiveSizing = {
  // Landmark Modal Sizing (AboutMe, Career, Adventure, etc.)
  landmarkModal: {
    // Modal container
    maxWidth: {
      mobile: '95vw',
      tablet: '85vw',
      desktop: '75vw',
      ultrawide: '65vw'
    },
    maxHeight: {
      all: '90vh'
    },
    padding: {
      mobile: '1.5rem',    // Adjust these values to make modals bigger/smaller
      tablet: '2.5rem',
      desktop: '3rem',
      ultrawide: '3.5rem'
    },
    borderRadius: {
      all: '2rem'
    }
  },

  // Projects (Ambition) Page
  projectsPage: {
    // Project card sizing
    card: {
      padding: {
        mobile: '1.25rem',   // Make cards thicker: increase these
        tablet: '1.5rem',
        desktop: '1.75rem'
      },
      borderRadius: '1.125rem',
      border: '2px',
      gap: {
        mobile: '0.75rem',   // Space between cards
        tablet: '1rem',
        desktop: '1rem'
      }
    },
    // Grid columns
    grid: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4,
      ultrawide: 5
    },
    // Typography
    typography: {
      title: {
        mobile: '1.125rem',  // 18px
        tablet: '1.25rem',   // 20px
        desktop: '1.5rem'    // 24px
      },
      description: {
        mobile: '0.8125rem', // 13px
        tablet: '0.875rem',  // 14px
        desktop: '1rem'      // 16px
      },
      badge: {
        mobile: '0.625rem',  // 10px
        tablet: '0.6875rem', // 11px
        desktop: '0.75rem'   // 12px
      }
    }
  },

  // Flight Controls
  flightControls: {
    position: {
      bottom: {
        mobile: '1rem',
        desktop: '1.5rem'
      },
      left: {
        mobile: '1rem',
        desktop: '1.5rem'
      }
    },
    size: {
      padding: {
        mobile: '0.75rem',
        desktop: '1rem'
      },
      width: {
        mobile: 'auto',
        desktop: 'auto'
      }
    },
    typography: {
      title: {
        mobile: '0.625rem',  // 10px
        desktop: '0.75rem'   // 12px
      },
      label: {
        mobile: '0.625rem',  // 10px
        desktop: '0.75rem'   // 12px
      }
    }
  },

  // Background Music Controls
  musicControls: {
    position: {
      bottom: {
        mobile: '1rem',
        desktop: '1.5rem'
      },
      right: {
        mobile: '1rem',
        desktop: '1.5rem'
      }
    },
    size: {
      width: {
        mobile: '14rem',
        desktop: '16rem'
      }
    }
  },

  // Location Prompt (Spacebar prompt)
  locationPrompt: {
    size: {
      width: {
        mobile: '90vw',
        tablet: '28rem',
        desktop: '32rem'
      },
      padding: {
        mobile: '1.25rem',
        tablet: '1.5rem',
        desktop: '1.75rem'
      }
    },
    position: {
      bottom: {
        mobile: '8rem',
        tablet: '10rem',
        desktop: '12rem'
      }
    }
  },

  // Visited Landmarks Tracker
  visitedLandmarks: {
    position: {
      top: {
        mobile: '1rem',
        desktop: '1.5rem'
      },
      right: {
        mobile: '1rem',
        desktop: '1.5rem'
      }
    },
    size: {
      padding: {
        mobile: '0.75rem',
        desktop: '1rem'
      }
    }
  }
}

/**
 * Helper function to get responsive value based on current breakpoint
 */
export function getResponsiveValue(
  config: { mobile?: string | number; tablet?: string | number; desktop?: string | number; ultrawide?: string | number; all?: string | number }
): string {
  // For CSS, return a clamp() function that scales smoothly
  const mobile = config.mobile || config.all || '1rem'
  const tablet = config.tablet || config.desktop || config.all || mobile
  const desktop = config.desktop || config.all || tablet
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ultrawide = config.ultrawide || desktop
  
  // Use CSS clamp for smooth scaling between breakpoints
  // Note: ultrawide reserved for future use in clamp() max value
  return `clamp(${mobile}, ${tablet}, ${desktop})`
}

/**
 * Generate Tailwind-style responsive classes
 */
export function generateResponsiveClasses(
  baseProp: string,
  values: { mobile?: string; tablet?: string; desktop?: string; large?: string; ultrawide?: string }
): string {
  const classes = []
  
  if (values.mobile) classes.push(`${baseProp}-[${values.mobile}]`)
  if (values.tablet) classes.push(`sm:${baseProp}-[${values.tablet}]`)
  if (values.desktop) classes.push(`md:${baseProp}-[${values.desktop}]`)
  if (values.large) classes.push(`lg:${baseProp}-[${values.large}]`)
  if (values.ultrawide) classes.push(`xl:${baseProp}-[${values.ultrawide}]`)
  
  return classes.join(' ')
}
