# 🕵️‍♂️ Reality Check: Code, Docs & Tests

**Purpose:**  
Surface anything that gives a false sense of completion — things that look finished but aren’t ready for real-world use.

Run a reality check across this codebase. The goal is to surface anything that gives a false sense of completion — things that look finished but aren’t ready for real-world use. Review the following areas critically:

---

## 1. Code

- **Mock Data & Stubs:**  
  Where are we still using mock data, hardcoded values, or stubbed logic?
- **TODOs & Shortcuts:**  
  Are there TODOs, shortcuts, or unhandled edge cases hiding under the surface?
- **External Integrations:**  
  Are all APIs, DBs, auth, payments, etc. properly wired, or just simulated?
- **Real-World Handling:**  
  Does the code handle latency, failure, and bad inputs, or just happy paths?

---

## 2. Documentation

- **Accuracy:**  
  Does the documentation reflect what actually exists, or just what we plan to build?
- **Setup & Usage:**  
  Are setup, API usage, or onboarding instructions complete and testable on a real machine?
- **Decisions & Assumptions:**  
  Are key decisions, tradeoffs, and assumptions clearly recorded?

---

## 3. Tests

- **Real Logic vs. Mocks:**  
  Are we testing against real logic or just mocks and fixtures?
- **Failure Modes:**  
  Do tests verify actual behavior under failure modes and edge inputs?
- **Coverage Illusions:**  
  Do test names or coverage percentages give a false sense of robustness?

---

## 4. Integration / System Readiness

- **Live Services:**  
  Is the system connected to live services, or still local-only/in dev mode?
- **Deployment Risks:**  
  What parts would break if deployed today? What still needs secrets, infra, or runtime scaffolding?

---

### ✅ Deliverable

Return a list of risks, gaps, and "mock illusions" to fix.  
Focus on clarity over blame. The goal is to turn apparent progress into real, shippable value.