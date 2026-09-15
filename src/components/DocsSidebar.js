"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const DOCS_NAV = [
  {
    category: 'Architecture',
    items: [
      {
        title: 'Overview',
        slug: 'architecture/overview',
        subItems: [
          { title: 'System Architecture', hash: '#system-architecture' },
          { title: 'State Management', hash: '#state-management' },
          { title: 'Database & Auth', hash: '#database--auth' }
        ]
      },
    ]
  },
  {
    category: 'Site Handbook',
    items: [
      {
        title: 'UI Components',
        slug: 'handbook/ui-components',
        subItems: [
          { title: 'Modals & Form Components', hash: '#1-modals-srccomponentsmodaljs' },
          { title: 'Task Views & Grids', hash: '#2-views--layout-components-srccomponentstaskjs' },
          { title: 'Filters & Controls', hash: '#3-controls--navigation-srccomponentsfiltercontrolsjs-headerjs-sidebarjs' }
        ]
      },
      {
        title: 'Pages & Routes',
        slug: 'handbook/pages-and-routes',
        subItems: [
          { title: 'Public Routes', hash: '#1-public-routes' },
          { title: 'Dashboard & Reports', hash: '#2-authenticated-organization-routes-orgiduserid' },
          { title: 'Admin & System', hash: '#3-administration--system-routes' }
        ]
      },
      {
        title: 'Database Schema',
        slug: 'handbook/database-schema',
        subItems: [
          { title: 'ERD Overview', hash: '#1-entity-relationship-overview' },
          { title: 'Table Specifications', hash: '#2-table-specifications' },
          { title: 'API Side-Effects', hash: '#3-database-side-effects-by-api-action' }
        ]
      },
    ]
  },
  {
    category: 'Development',
    items: [
      {
        title: 'Project Structure',
        slug: 'development/project-structure',
        subItems: [
          { title: 'Directory Tree', hash: '#directory-tree' },
          { title: 'Core Libraries', hash: '#core-libraries' }
        ]
      },
      {
        title: 'Coding Standards',
        slug: 'development/coding-standards',
        subItems: [
          { title: 'React Conventions', hash: '#3-component-guidelines' },
          { title: 'State Strategy', hash: '#4-state-management-the-hybrid-approach' }
        ]
      },
    ]
  },
  {
    category: 'Features',
    items: [
      {
        title: 'Task Management',
        slug: 'features/task-management',
        subItems: [
          { title: 'Task Lifecycle', hash: '#1-feature-overview' },
          { title: 'ClickUp URL Scraping', hash: '#clickup-url-parsing' },
          { title: 'Copy Task Clipboard', hash: '#copy-task-feature' }
        ]
      },
      {
        title: 'Projects & Organizations',
        slug: 'features/projects-and-organizations',
        subItems: [
          { title: 'Organizations & Config', hash: '#1-organizations' },
          { title: 'Project Access & RBAC', hash: '#2-projects' }
        ]
      },
      {
        title: 'Time Logging & Reports',
        slug: 'features/time-logging-and-reports',
        subItems: [
          { title: 'Variance Formulas', hash: '#hour-variance-math' },
          { title: 'Export Capabilities', hash: '#reporting' }
        ]
      },
    ]
  },
  {
    category: 'API & Reference',
    items: [
      {
        title: 'API Endpoints',
        slug: 'api/endpoints',
        subItems: [
          { title: 'Authentication API', hash: '#1-authentication-api-apiauth' },
          { title: 'Tasks & Time API', hash: '#2-tasks--time-logging-api-apitasks' },
          { title: 'Projects API', hash: '#3-projects-api-apiprojects' },
          { title: 'Organization API', hash: '#4-organization-api-apiorganization' },
          { title: 'Reports API', hash: '#5-reports-api-apireports' }
        ]
      },
      {
        title: 'Testing Strategy',
        slug: 'testing/testing-strategy',
        subItems: [
          { title: 'Unit Tests', hash: '#unit-testing' },
          { title: 'Coverage Metrics', hash: '#coverage' }
        ]
      },
      {
        title: 'Deployment Guide',
        slug: 'deployment/deployment',
        subItems: [
          { title: 'Vercel Deployment', hash: '#3-deployment-to-vercel-recommended' },
          { title: 'Database Setup', hash: '#4-database-migrations' }
        ]
      },
    ]
  }
];

export default function DocsSidebar() {
  const pathname = usePathname(); // e.g., "/docs/features/task-management"
  const [activeHash, setActiveHash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Set initial hash
    setActiveHash(window.location.hash);
    
    // Listen for hash changes
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]); // Also re-check when pathname changes

  // Extract slug from pathname
  const docPath = pathname?.replace('/docs/', '') || 'architecture/overview';

  const SidebarContent = (
    <>
      <div className="flex items-center justify-between md:hidden mb-6 px-2">
        <span className="font-bold text-zinc-300">Documentation</span>
        <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white p-2">
          ✕
        </button>
      </div>
      <div className="space-y-6">
        {DOCS_NAV.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 px-2">
              {cat.category}
            </h4>
            <ul className="space-y-1">
              {cat.items.map((item) => {
                const isActive = docPath === item.slug || (docPath === '' && item.slug === 'architecture/overview');
                
                return (
                  <li key={item.slug} className="space-y-1">
                    <Link
                      href={`/docs/${item.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <span>{item.title}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                    </Link>
                    
                    {/* Render subItems ONLY if this item is active, fixing the massive sidebar issue */}
                    {item.subItems && isActive && (
                      <ul className="pl-4 space-y-1 border-l border-zinc-800/60 ml-3">
                        {item.subItems.map((sub) => {
                          const isSubActive = activeHash === sub.hash;
                          return (
                            <li key={sub.title}>
                              <a
                                href={sub.hash}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveHash(sub.hash);
                                  setMobileMenuOpen(false);
                                  window.history.pushState(null, '', sub.hash);
                                  window.dispatchEvent(new Event('hashchange'));
                                }}
                                className={`block px-2 py-1.5 rounded text-[11px] font-medium transition truncate ${
                                  isSubActive 
                                    ? 'text-orange-400 bg-orange-500/10' 
                                    : 'text-zinc-500 hover:text-orange-400 hover:bg-zinc-900/50'
                                }`}
                              >
                                • {sub.title}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="bg-orange-500 text-black px-4 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          Menu
        </button>
      </div>

      {/* Desktop Sidebar (Sticky) */}
      <aside className="w-72 border-r border-zinc-800/80 p-6 shrink-0 hidden md:block space-y-6 bg-zinc-950/30 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end">
          <aside className="w-4/5 max-w-sm h-full bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
