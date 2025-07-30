# Claude Code CLI Definition of Done - Optimized Workflow

Streamlined for maximum Claude Code CLI efficiency, autonomous development, and context optimization to avoid hitting usage limits.

<rule>
name: claude_code_optimized_workflow
filters:
  - type: event
    pattern: "user_request|task_start|development_request"
  - type: command
    pattern: "implement|develop|fix|add|complete|done|build|create"

actions:
  - type: react
    event: "task_start"
    priority: critical
    action: |
      # ⚡ CLAUDE CODE CLI OPTIMIZED WORKFLOW
      
      **🎯 EFFICIENCY-FIRST AUTONOMOUS DEVELOPMENT**
      
      **Step 1: 📋 Smart Task Planning (Parallel Information Gathering)**
      - **Batch Read Operations**: Use multiple Read/Glob/Grep tools in single messages
      - **TodoWrite Integration**: Track progress immediately, break complex tasks into manageable chunks
      - **Context Optimization**: Read only essential specs (MASTER_SPEC.md, current task requirements)
      - **Dependency Validation**: Quick scan for blockers, resolve immediately or defer
      
      **Step 2: 🏗 Implementation-First with Progressive Quality**
      - **Functional Progress Priority**: Get working code first, optimize types/tests incrementally
      - **ShadCN Foundation**: Use pre-built components to minimize custom implementation
      - **Plugin Architecture**: Follow mandatory patterns from MASTER_SPEC.md
      - **Parallel Tool Usage**: Edit multiple files simultaneously when possible
      - **File Size Awareness**: Keep components <300 lines, utilities <200 lines per file-size-limits.md
      
      **Step 3: 🔄 Continuous Validation (Smart Gate Strategy)**
      - **Progressive TypeScript**: Fix critical errors immediately, defer minor issues with @ts-ignore
      - **Essential Testing**: Focus on core functionality tests, expand coverage incrementally  
      - **Real-time Validation**: Run type-check/build frequently to catch issues early
      - **Context-Aware Fixes**: Bundle related fixes to minimize tool usage
      
      **CLAUDE CODE CLI OPTIMIZATION STRATEGIES:**
      - **Batch Operations**: Multiple tool calls per message whenever possible
      - **Context Preservation**: Minimize file re-reading, maintain working context
      - **Progressive Enhancement**: Working code → type safety → comprehensive tests → polish
      - **Smart Prioritization**: Fix blockers first, defer nice-to-haves
      - **Efficient Debugging**: Use targeted Grep/Read instead of broad exploration

  - type: react
    event: "implementation_complete"
    priority: critical
    action: |
      # 🚦 STREAMLINED QUALITY GATES (CONTEXT OPTIMIZED)
      
      **PROGRESSIVE VALIDATION APPROACH**
      
      **🔴 GATE 1: Functional Compilation (SMART PROGRESSIVE)**
      - **Command**: `npm run type-check`
      - **Strategy**: Fix critical errors blocking functionality, defer cosmetic type issues
      - **Claude Code Best Practice**: Use @ts-ignore strategically to maintain progress
      - **Success Criteria**: No blocking compilation errors, core functionality intact
      
      **🟡 GATE 2: Core Functionality Tests (ESSENTIAL COVERAGE)**
      - **Command**: `npm test`
      - **Strategy**: Focus on critical path tests, expand coverage in subsequent iterations
      - **Claude Code Best Practice**: Test core features thoroughly, secondary features progressively
      - **Success Criteria**: Key functionality tested and passing
      
      **🟢 GATE 3: Build Integrity (FAST FEEDBACK)**
      - **Command**: `npm run build`
      - **Strategy**: Quick build validation, address major issues immediately
      - **Claude Code Best Practice**: Incremental builds catch issues early
      - **Success Criteria**: Clean build with core features working
      
      **🔵 GATE 4: Accessibility Essentials (WCAG PROGRESSIVE)**
      - **Command**: `npm run test:a11y`
      - **Strategy**: Fix critical accessibility issues, improve incrementally
      - **Claude Code Best Practice**: Address major violations first, enhance over time
      - **Success Criteria**: No critical accessibility barriers
      
      **⚡ AUTONOMOUS CONTINUATION STRATEGY**
      - Update TodoWrite with smart next steps
      - Identify highest-impact next task
      - Continue development without manual intervention
      - Optimize for continuous progress over perfect completion

  - type: suggest
    message: |
      ### ⚡ Claude Code CLI Optimized Checklist
      
      **📋 SMART PLANNING:**
      - [ ] Batch read essential specs and requirements
      - [ ] TodoWrite updated with realistic task breakdown
      - [ ] Dependencies checked and blockers identified
      
      **🏗 EFFICIENT IMPLEMENTATION:**
      - [ ] Working functionality implemented first
      - [ ] ShadCN components used (no custom UI rebuilding)
      - [ ] Plugin architecture patterns followed
      - [ ] File size limits respected (<300 lines components)
      
      **🚦 PROGRESSIVE QUALITY GATES:**
      - [ ] 🔴 TypeScript: Critical errors fixed (cosmetic issues deferred)
      - [ ] 🟡 Tests: Core functionality tested and passing
      - [ ] 🟢 Build: Clean build with working features
      - [ ] 🔵 Accessibility: Major violations addressed
      
      **⚡ AUTONOMOUS CONTINUATION:**
      - [ ] TodoWrite updated with next high-impact task
      - [ ] Context preserved for seamless progression
      - [ ] Ready for continuous autonomous development

examples:
  - input: "Implement authentication feature"
    output: "Starting optimized workflow: batch reading auth specs, setting TodoWrite, implementing core login flow first"
  - input: "Fix all TypeScript errors before proceeding"
    output: "Optimized approach: fixing critical compilation blockers first, deferring cosmetic type issues with @ts-ignore"

metadata:
  priority: critical
  version: 3.0
  type: claude_code_optimized
  optimization: context_efficient
  enforcement: progressive
</rule>