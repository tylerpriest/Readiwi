# Documentation Consolidation Prompt for Claude Code CLI

## The Situation
Documentation has sprawled again. Multiple files contain overlapping information, making autonomous development inefficient. The documentation needs to be restructured to match how Claude Code CLI actually works.

## The Request

**"The documentation was created to give you everything needed to build an amazing app autonomously, but it's not optimized for how you actually work. Please audit and restructure the documentation to eliminate inefficiencies and maximize autonomous development velocity."**

**Audit Questions:**
1. **Tool Usage Efficiency**: How many file reads does it take you to understand the project and start building meaningfully?
2. **Information Architecture**: Is the most critical information (patterns, current status, priorities) immediately accessible?
3. **Decision Speed**: Can you make implementation decisions without searching through multiple documents?
4. **Context Retention**: Do you need to re-read files frequently, or is information structured for progressive access?
5. **Ambiguity Elimination**: Are there clear problems to solve with defined success criteria, or prescriptive instructions that limit innovation?

**Optimization Criteria:**
- **Startup Velocity**: From project start to first meaningful code change in ≤3 tool calls
- **Context Efficiency**: Essential patterns and status accessible without excessive reading
- **Progressive Disclosure**: Information hierarchy that matches Claude Code workflow
- **Innovation Freedom**: Problems defined with success criteria, not implementation instructions
- **Autonomous Flow**: No waiting for clarification or permission - everything needed to build is clear

**Expected Structure:**
1. **CLAUDE_CONTEXT.md** - Single source of truth for immediate project understanding
2. **PATTERNS.md** - Exact code structures for consistent implementation  
3. **FEATURES.md** - Current status and priorities for progressive development
4. **Challenge files** - Innovation challenges for specific features (position tracking, performance, etc.)

**Consolidation Rules:**
- **Merge** where information overlaps or serves same purpose
- **Split** where single files contain multiple distinct concerns
- **Eliminate** outdated or redundant information
- **Prioritize** based on frequency of access during development
- **Structure** for Claude Code workflow optimization, not human documentation standards

**Success Metrics:**
- Reduced file count while maintaining comprehensive coverage
- Faster autonomous development startup
- Clearer decision-making without ambiguity
- Innovation challenges instead of prescriptive requirements
- Seamless integration with Claude Code development patterns

## Context from Original Creation Process

The documentation was created through multiple iterations to be "everything Claude Code CLI needs to build the app with every spec, every developmental guideline, every design decision pointed out." However, it was optimized for comprehensiveness rather than Claude Code workflow efficiency.

The goal is to maintain the thoroughness that enables autonomous development while restructuring for maximum efficiency in how Claude Code actually processes and uses information.

## Key Insight

Transform documentation from "comprehensive human-readable specs" to "optimized autonomous development enablement" - maintaining all necessary information while eliminating friction in the Claude Code workflow.