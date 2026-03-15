using ConferenceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ConferenceDbContext db)
    {
        // ── Admin user (always ensure present) ───────────────────────────────
        if (!await db.Users.AnyAsync(u => u.Email == "admin@conference.dev"))
        {
            db.Users.Add(new User
            {
                Name = "Admin",
                Email = "admin@conference.dev",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
            });
            await db.SaveChangesAsync();
        }

        // ── Regular test users ────────────────────────────────────────────────
        var testUsers = new[]
        {
            ("user1@test.dev", "User One",   "Test123!"),
            ("user2@test.dev", "User Two",   "Test123!"),
            ("user3@test.dev", "User Three", "Test123!"),
        };

        var seededUserIds = new Dictionary<string, Guid>();
        foreach (var (email, name, password) in testUsers)
        {
            var existing = await db.Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Email == email);
            if (existing == null)
            {
                var u = new User
                {
                    Name = name,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Role = UserRole.Attendee,
                };
                db.Users.Add(u);
                await db.SaveChangesAsync();
                seededUserIds[email] = u.Id;
            }
            else
            {
                seededUserIds[email] = existing.Id;
            }
        }

        // ── Main conference data (idempotent guard) ───────────────────────────
        // Check for a record that only exists after the full TASK-53 seed runs,
        // so a stale pre-existing conference doesn't short-circuit seeding.
        if (await db.Conferences.IgnoreQueryFilters().AnyAsync(c => c.Name == "DevSummit 2025")) return;

        // ── Purge stale partial data before re-seeding ───────────────────────
        // Removes any conferences/speakers/tracks/sessions left from before TASK-53
        // so that the full seed can be inserted cleanly without duplicates.
        var staleConferences = await db.Conferences.IgnoreQueryFilters().ToListAsync();
        if (staleConferences.Count > 0)
        {
            var staleConfIds = staleConferences.Select(c => c.Id).ToList();
            var staleTracks = await db.Tracks.IgnoreQueryFilters()
                .Where(t => staleConfIds.Contains(t.ConferenceId)).ToListAsync();
            if (staleTracks.Count > 0)
            {
                var staleTrackIds = staleTracks.Select(t => t.Id).ToList();
                var staleSessions = await db.Sessions.IgnoreQueryFilters()
                    .Where(s => staleTrackIds.Contains(s.TrackId)).ToListAsync();
                if (staleSessions.Count > 0)
                {
                    var staleSessionIds = staleSessions.Select(s => s.Id).ToList();
                    var staleSessionSpeakers = await db.SessionSpeakers
                        .Where(ss => staleSessionIds.Contains(ss.SessionId)).ToListAsync();
                    db.SessionSpeakers.RemoveRange(staleSessionSpeakers);
                    var staleRegistrations = await db.Registrations.IgnoreQueryFilters()
                        .Where(r => staleSessionIds.Contains(r.SessionId)).ToListAsync();
                    db.Registrations.RemoveRange(staleRegistrations);
                    db.Sessions.RemoveRange(staleSessions);
                }
                db.Tracks.RemoveRange(staleTracks);
            }
            db.Conferences.RemoveRange(staleConferences);
            await db.SaveChangesAsync();
        }

        var staleSpeakers = await db.Speakers.IgnoreQueryFilters().ToListAsync();
        if (staleSpeakers.Count > 0)
        {
            db.Speakers.RemoveRange(staleSpeakers);
            await db.SaveChangesAsync();
        }

        // ── Speakers ──────────────────────────────────────────────────────────
        static string Avatar(string name) =>
            $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name)}&size=200&background=random";

        var spAlice    = new Speaker { Name = "Alice Chen",          Bio = "Senior Software Engineer at Contoso, specialising in distributed systems and cloud-native architecture with 12 years of experience building high-throughput APIs.", Email = "alice@example.com",     Company = "Contoso",             TwitterHandle = "@alicechen",      PhotoUrl = Avatar("Alice Chen") };
        var spBob      = new Speaker { Name = "Bob Martinez",        Bio = "Full-stack developer and open-source contributor with 10 years of experience in .NET and React. Passionate about developer experience and tooling.", Email = "bob@example.com",       Company = "Fabrikam",            TwitterHandle = "@bobdev",         PhotoUrl = Avatar("Bob Martinez") };
        var spCarol    = new Speaker { Name = "Carol Johnson",       Bio = "Principal Engineer at Microsoft working on the .NET runtime. She drives performance initiatives that ship in every release of .NET Core.", Email = "carol@microsoft.com",   Company = "Microsoft",           TwitterHandle = "@carolj_msft",    PhotoUrl = Avatar("Carol Johnson") };
        var spDavid    = new Speaker { Name = "David Kim",           Bio = "Staff Engineer at Google leading the Site Reliability Engineering practice for Google Cloud Run. Author of popular Kubernetes reliability patterns.", Email = "david@google.com",      Company = "Google",              TwitterHandle = "@davidkim_sre",   PhotoUrl = Avatar("David Kim") };
        var spEmma     = new Speaker { Name = "Emma Wilson",         Bio = "Principal Cloud Architect at AWS specialising in multi-region resilient systems. AWS Hero and frequent conference keynote speaker.", Email = "emma@aws.com",          Company = "Amazon Web Services", TwitterHandle = "@emmawilson_aws", PhotoUrl = Avatar("Emma Wilson") };
        var spFrank    = new Speaker { Name = "Frank Brown",         Bio = "Distinguished Engineer at Netflix working on the streaming platform data pipeline. Co-creator of the Netflix OSS chaos engineering toolkit.", Email = "frank@netflix.com",     Company = "Netflix",             TwitterHandle = "@frankb_oss",     PhotoUrl = Avatar("Frank Brown") };
        var spGrace    = new Speaker { Name = "Grace Davis",         Bio = "Engineering Manager at Meta leading the React core team. Contributor to the React Server Components RFC and concurrent mode stabilisation.", Email = "grace@meta.com",        Company = "Meta",                TwitterHandle = "@gracedavis",     PhotoUrl = Avatar("Grace Davis") };
        var spHenry    = new Speaker { Name = "Henry Thompson",      Bio = "Platform Engineer at Stripe building the payments infrastructure that processes millions of transactions daily. Expert in distributed transactions and consistency.", Email = "henry@stripe.com",      Company = "Stripe",              TwitterHandle = "@henryt_stripe",  PhotoUrl = Avatar("Henry Thompson") };
        var spIsabella = new Speaker { Name = "Isabella Rodriguez",  Bio = "Senior Developer Advocate at Shopify, specialising in Hydrogen (React-based storefront framework) and edge computing use-cases.", Email = "isabella@shopify.com",  Company = "Shopify",             TwitterHandle = "@isabellar",      PhotoUrl = Avatar("Isabella Rodriguez") };
        var spJames    = new Speaker { Name = "James Wilson",        Bio = "Staff Engineer at GitHub working on Actions infrastructure and developer workflows. Contributor to multiple CNCF open-source projects.", Email = "james@github.com",      Company = "GitHub",              TwitterHandle = "@jameswilson",    PhotoUrl = Avatar("James Wilson") };
        var spKate     = new Speaker { Name = "Kate Anderson",       Bio = "Head of Developer Experience at Vercel. Formerly on the Next.js core team; now focused on edge rendering and incremental static regeneration.", Email = "kate@vercel.com",       Company = "Vercel",              TwitterHandle = "@kateanderson",   PhotoUrl = Avatar("Kate Anderson") };
        var spLiam     = new Speaker { Name = "Liam Chen",           Bio = "Senior Software Engineer at HashiCorp, author of several Terraform providers and the go-getter library used by the broader HashiCorp ecosystem.", Email = "liam@hashicorp.com",    Company = "HashiCorp",           TwitterHandle = "@liamchen_hcp",   PhotoUrl = Avatar("Liam Chen") };
        var spMia      = new Speaker { Name = "Mia Williams",        Bio = "Principal Engineer at Cloudflare working on Workers and the edge-computing runtime. Speaker on WebAssembly, V8 isolates, and serverless security.", Email = "mia@cloudflare.com",    Company = "Cloudflare",          TwitterHandle = "@miawilliams",    PhotoUrl = Avatar("Mia Williams") };
        var spNoah     = new Speaker { Name = "Noah Taylor",         Bio = "Core maintainer of the Moby project at Docker and contributor to containerd and the OCI runtime spec. Talks frequently about container internals and image layering.", Email = "noah@docker.com",       Company = "Docker",              TwitterHandle = "@noahtaylor_oci", PhotoUrl = Avatar("Noah Taylor") };
        var spOlivia   = new Speaker { Name = "Olivia Brown",        Bio = "Developer Advocate at JetBrains with deep expertise in Kotlin and the IntelliJ Platform. Author of Idiomatic Kotlin and regular KotlinConf keynote speaker.", Email = "olivia@jetbrains.com",  Company = "JetBrains",           TwitterHandle = "@oliviabrown_jb", PhotoUrl = Avatar("Olivia Brown") };
        var spPatrick  = new Speaker { Name = "Patrick Garcia",      Bio = "Principal Architect at Red Hat working on OpenShift and the Kubernetes Operator Framework. Active CNCF TOC member and SIG lead.", Email = "patrick@redhat.com",    Company = "Red Hat",             TwitterHandle = "@patrickgarcia",  PhotoUrl = Avatar("Patrick Garcia") };
        var spQuinn    = new Speaker { Name = "Quinn Robinson",      Bio = "Staff Engineer at Elastic working on Elasticsearch performance and the ECS (Elastic Common Schema). Frequent speaker on search relevance and vector search.", Email = "quinn@elastic.com",     Company = "Elastic",             TwitterHandle = "@quinnrobinson",  PhotoUrl = Avatar("Quinn Robinson") };

        var allSpeakers = new[]
        {
            spAlice, spBob, spCarol, spDavid, spEmma, spFrank, spGrace, spHenry,
            spIsabella, spJames, spKate, spLiam, spMia, spNoah, spOlivia, spPatrick, spQuinn,
        };
        db.Speakers.AddRange(allSpeakers);

        // ── Conferences ───────────────────────────────────────────────────────
        var conf2023Id = Guid.NewGuid();
        var conf2025Id = Guid.NewGuid();
        var conf2026Id = Guid.NewGuid();

        db.Conferences.AddRange(
            new Conference
            {
                Id = conf2023Id,
                Name = "TechConf 2023",
                Description = "TechConf 2023 brought together 2,000 developers in New York for three days of deep-dive sessions on cloud, DevOps, and modern application architecture.",
                StartDate = new DateTime(2023, 10, 12, 9, 0, 0, DateTimeKind.Utc),
                EndDate   = new DateTime(2023, 10, 14, 18, 0, 0, DateTimeKind.Utc),
                Location  = "New York, NY",
                WebsiteUrl = "https://techconf2023.example.com",
            },
            new Conference
            {
                Id = conf2025Id,
                Name = "DevSummit 2025",
                Description = "DevSummit 2025 is the must-attend gathering for full-stack engineers, platform teams, and technical leaders. Six tracks, 40+ sessions, and workshops across two days in Chicago.",
                StartDate = new DateTime(2025, 6, 10, 9, 0, 0, DateTimeKind.Utc),
                EndDate   = new DateTime(2025, 6, 12, 18, 0, 0, DateTimeKind.Utc),
                Location  = "Chicago, IL",
                WebsiteUrl = "https://devsummit2025.example.com",
            },
            new Conference
            {
                Id = conf2026Id,
                Name = "TechConf 2026",
                Description = "The premier conference for software developers and architects returns to San Francisco. Expect cutting-edge keynotes, six specialised tracks, and hands-on workshops.",
                StartDate = new DateTime(2026, 6, 15, 9, 0, 0, DateTimeKind.Utc),
                EndDate   = new DateTime(2026, 6, 16, 18, 0, 0, DateTimeKind.Utc),
                Location  = "San Francisco, CA",
                WebsiteUrl = "https://techconf2026.example.com",
            }
        );

        // ── Track factory ─────────────────────────────────────────────────────
        static Track MakeTrack(Guid confId, string name, string desc, string color, int sort) =>
            new() { ConferenceId = confId, Name = name, Description = desc, Color = color, SortOrder = sort };

        // TechConf 2023 tracks
        var t23Backend  = MakeTrack(conf2023Id, "Backend & APIs",    "Server-side development, REST, gRPC, databases.",            "#6366f1", 1);
        var t23Frontend = MakeTrack(conf2023Id, "Frontend & UX",     "React, TypeScript, design systems, and accessibility.",      "#8b5cf6", 2);
        var t23DevOps   = MakeTrack(conf2023Id, "DevOps & Cloud",    "CI/CD, containers, Kubernetes, cloud platforms.",            "#ec4899", 3);
        var t23Security = MakeTrack(conf2023Id, "Security",          "AppSec, OWASP, zero-trust, and supply-chain security.",      "#ef4444", 4);
        var t23Data     = MakeTrack(conf2023Id, "Data & AI",         "Data pipelines, ML ops, and AI-assisted development.",       "#f59e0b", 5);
        var t23Mobile   = MakeTrack(conf2023Id, "Mobile",            "iOS, Android, React Native, and cross-platform strategies.", "#14b8a6", 6);

        // DevSummit 2025 tracks
        var t25Backend  = MakeTrack(conf2025Id, "Backend & APIs",    "Deep dives into .NET, APIs, databases, and cloud services.", "#6366f1", 1);
        var t25Frontend = MakeTrack(conf2025Id, "Frontend & UX",     "Everything React, TypeScript, design systems, and accessibility.", "#8b5cf6", 2);
        var t25DevOps   = MakeTrack(conf2025Id, "DevOps & Cloud",    "Modern CI/CD, GitOps, Kubernetes, and platform engineering.", "#ec4899", 3);
        var t25Security = MakeTrack(conf2025Id, "Security",          "Securing APIs, containers, and the software supply chain.", "#ef4444", 4);
        var t25Data     = MakeTrack(conf2025Id, "Data & AI",         "Vector databases, LLM integration, and ML pipelines.",      "#f59e0b", 5);
        var t25Arch     = MakeTrack(conf2025Id, "Architecture",      "System design patterns, event-driven systems, CQRS/ES.",    "#10b981", 6);

        // TechConf 2026 tracks
        var t26Backend  = MakeTrack(conf2026Id, "Backend & APIs",    "Next-generation server-side patterns and .NET innovations.", "#6366f1", 1);
        var t26Frontend = MakeTrack(conf2026Id, "Frontend & UX",     "The future of the web: React 19, edge rendering, and AI UI.", "#8b5cf6", 2);
        var t26DevOps   = MakeTrack(conf2026Id, "DevOps & Cloud",    "Platform engineering, internal developer platforms, FinOps.", "#ec4899", 3);
        var t26Security = MakeTrack(conf2026Id, "Security",          "Post-quantum crypto, zero-trust, and AI-driven threat detection.", "#ef4444", 4);
        var t26Data     = MakeTrack(conf2026Id, "Data & AI",         "Production AI systems, RAG architectures, and fine-tuning.", "#f59e0b", 5);
        var t26Platform = MakeTrack(conf2026Id, "Platform Engineering", "Internal developer platforms, golden paths, and paved roads.", "#10b981", 6);

        db.Tracks.AddRange(
            t23Backend, t23Frontend, t23DevOps, t23Security, t23Data, t23Mobile,
            t25Backend, t25Frontend, t25DevOps, t25Security, t25Data, t25Arch,
            t26Backend, t26Frontend, t26DevOps, t26Security, t26Data, t26Platform
        );

        // ── Session factory ───────────────────────────────────────────────────
        static Session MakeSession(
            Guid trackId, string title, string desc,
            DateTime start, DateTime end,
            string room, int capacity, string type, string level) =>
            new()
            {
                TrackId     = trackId,
                Title       = title,
                Description = desc,
                StartTime   = start,
                EndTime     = end,
                Room        = room,
                Capacity    = capacity,
                SessionType = type,
                Level       = level,
            };

        static DateTime DT(int year, int month, int day, int hour, int minute) =>
            new(year, month, day, hour, minute, 0, DateTimeKind.Utc);

        // ── TechConf 2023 sessions (14) ───────────────────────────────────────
        var s23_01 = MakeSession(t23Backend.Id,  "Keynote: The State of .NET in 2023",                  "An overview of the .NET 8 roadmap, performance improvements, and what is coming in ASP.NET Core.",                                                                         DT(2023,10,12,9,0),  DT(2023,10,12,10,0), "Main Stage",  500, "Keynote",  "All");
        var s23_02 = MakeSession(t23Backend.Id,  "Minimal APIs in ASP.NET Core 8",                      "Build lightweight, high-performance HTTP services with the new minimal API surface in .NET 8, covering routing, validation, and OpenAPI integration.",                     DT(2023,10,12,10,30),DT(2023,10,12,11,30),"Hall A",      200, "Talk",     "Intermediate");
        var s23_03 = MakeSession(t23Backend.Id,  "PostgreSQL Advanced Query Patterns",                  "Window functions, CTEs, JSONB operators, and index strategies to make your Postgres queries fly.",                                                                         DT(2023,10,12,13,0), DT(2023,10,12,14,0), "Hall A",      180, "Talk",     "Advanced");
        var s23_04 = MakeSession(t23Frontend.Id, "TypeScript 5.0: New Features Deep Dive",              "Decorators, const type parameters, variadic tuple labels and more: everything you need to know about TypeScript 5.",                                                       DT(2023,10,12,10,30),DT(2023,10,12,11,30),"Hall B",      150, "Talk",     "Intermediate");
        var s23_05 = MakeSession(t23Frontend.Id, "Accessible Component Design Patterns",                "Building truly accessible React components from the ground up: ARIA patterns, keyboard navigation, colour contrast, and screen-reader testing.",                           DT(2023,10,12,13,0), DT(2023,10,12,14,0), "Hall B",      150, "Talk",     "Beginner");
        var s23_06 = MakeSession(t23DevOps.Id,   "GitOps with Argo CD",                                 "Implementing a pull-based GitOps pipeline using Argo CD, Helm, and Kustomize for a production Kubernetes cluster.",                                                       DT(2023,10,12,10,30),DT(2023,10,12,12,0), "Workshop A",   40, "Workshop", "Intermediate");
        var s23_07 = MakeSession(t23DevOps.Id,   "Kubernetes Cost Optimisation",                        "Right-sizing workloads, spot instances, Cluster Autoscaler, and Karpenter: practical techniques for slashing your cloud bill.",                                           DT(2023,10,12,13,0), DT(2023,10,12,14,0), "Hall C",      120, "Talk",     "Advanced");
        var s23_08 = MakeSession(t23Security.Id, "OWASP Top 10 for Developers",                         "Walk through each OWASP Top 10 risk with real code examples in C# and TypeScript, plus automated scanning tooling you can adopt today.",                                  DT(2023,10,13,9,0),  DT(2023,10,13,10,0), "Hall A",      200, "Talk",     "Beginner");
        var s23_09 = MakeSession(t23Security.Id, "Securing the Software Supply Chain",                  "SLSA, SBOM generation, Sigstore signing, and how to evaluate third-party dependencies without slowing delivery.",                                                         DT(2023,10,13,10,30),DT(2023,10,13,11,30),"Hall A",      180, "Talk",     "Intermediate");
        var s23_10 = MakeSession(t23Data.Id,     "Building Real-Time Analytics Pipelines",              "Apache Kafka, Apache Flink, and ClickHouse: assembling a sub-second analytics pipeline capable of handling millions of events per minute.",                               DT(2023,10,13,10,30),DT(2023,10,13,12,0), "Workshop B",   40, "Workshop", "Advanced");
        var s23_11 = MakeSession(t23Data.Id,     "Intro to ML Ops with Azure ML",                       "From notebook to production: model training, versioning, deployment, and monitoring using Azure Machine Learning.",                                                       DT(2023,10,13,13,0), DT(2023,10,13,14,0), "Hall C",      120, "Talk",     "Beginner");
        var s23_12 = MakeSession(t23Mobile.Id,   "React Native New Architecture",                       "The new React Native architecture (JSI, Fabric, TurboModules) explained, and how to migrate your existing apps.",                                                        DT(2023,10,13,10,30),DT(2023,10,13,11,30),"Hall B",      150, "Talk",     "Intermediate");
        var s23_13 = MakeSession(t23Mobile.Id,   "Cross-Platform Apps with MAUI",                       ".NET MAUI for iOS, Android, macOS, and Windows: architecture, testing strategies, and production tips.",                                                                 DT(2023,10,13,13,0), DT(2023,10,13,14,0), "Hall B",      150, "Talk",     "Beginner");
        var s23_14 = MakeSession(t23Backend.Id,  "Closing Keynote: The Future of Developer Tooling",    "A retrospective on how developer tooling evolved in 2023 and a look at AI-assisted coding, semantic search, and what is next.",                                          DT(2023,10,14,16,0), DT(2023,10,14,17,0), "Main Stage",  500, "Keynote",  "All");

        // ── DevSummit 2025 sessions (15) ──────────────────────────────────────
        var s25_01 = MakeSession(t25Backend.Id,  "Keynote: .NET 10 and the Road to Cloud Native",       "The .NET 10 release: performance benchmarks, new language features in C# 14, and how Aspire is redefining cloud-native .NET development.",                               DT(2025,6,10,9,0),   DT(2025,6,10,10,0),  "Main Stage",  500, "Keynote",  "All");
        var s25_02 = MakeSession(t25Backend.Id,  "Building Scalable APIs with .NET Aspire",             "Learn how to build and orchestrate microservices using .NET Aspire, from local dev to production on Azure Container Apps.",                                               DT(2025,6,10,10,30), DT(2025,6,10,11,30), "Hall A",      200, "Talk",     "Intermediate");
        var s25_03 = MakeSession(t25Backend.Id,  "PostgreSQL Performance Tuning",                       "Practical indexing strategies, query optimisation, EXPLAIN ANALYZE, and connection pooling for high-traffic production applications.",                                    DT(2025,6,10,13,0),  DT(2025,6,10,14,0),  "Hall A",      200, "Talk",     "Advanced");
        var s25_04 = MakeSession(t25Frontend.Id, "React 18 and Beyond",                                 "Concurrent rendering, React Server Components, the App Router in Next.js 14, and what is coming in React 19.",                                                          DT(2025,6,10,10,30), DT(2025,6,10,11,30), "Hall B",      150, "Talk",     "Intermediate");
        var s25_05 = MakeSession(t25Frontend.Id, "Design Systems with Tailwind CSS",                    "Building consistent, accessible component libraries using Tailwind CSS and design tokens. Live-coding a full design system from scratch.",                                DT(2025,6,10,13,0),  DT(2025,6,10,14,0),  "Hall B",      150, "Talk",     "Beginner");
        var s25_06 = MakeSession(t25DevOps.Id,   "Platform Engineering with Backstage",                 "Building an Internal Developer Platform with Backstage, golden templates, TechDocs, and software catalogues. Hands-on workshop.",                                        DT(2025,6,10,10,30), DT(2025,6,10,12,0),  "Workshop A",   40, "Workshop", "Intermediate");
        var s25_07 = MakeSession(t25DevOps.Id,   "GitOps at Scale",                                     "Fleet management with Argo CD ApplicationSets, multi-cluster rollouts with Flagger, and progressive delivery strategies in production.",                                 DT(2025,6,10,13,0),  DT(2025,6,10,14,0),  "Hall C",      120, "Talk",     "Advanced");
        var s25_08 = MakeSession(t25Security.Id, "Zero Trust Architecture Patterns",                    "Implementing zero-trust networking in Kubernetes with mTLS (Istio/Cilium), workload identity (SPIFFE/SPIRE), and policy enforcement.",                                   DT(2025,6,11,10,30), DT(2025,6,11,11,30), "Hall A",      180, "Talk",     "Advanced");
        var s25_09 = MakeSession(t25Security.Id, "API Security Best Practices",                         "OAuth 2.0 flows, PKCE, JWT hardening, rate-limiting, and automated API security testing with OWASP ZAP and Postman.",                                                   DT(2025,6,11,13,0),  DT(2025,6,11,14,0),  "Hall A",      180, "Talk",     "Intermediate");
        var s25_10 = MakeSession(t25Data.Id,     "Vector Databases and RAG Architectures",              "Build a production-ready Retrieval-Augmented Generation system with pgvector, semantic search, and OpenAI embeddings.",                                                   DT(2025,6,11,10,30), DT(2025,6,11,12,0),  "Workshop B",   40, "Workshop", "Intermediate");
        var s25_11 = MakeSession(t25Data.Id,     "Real-Time ML Inference at the Edge",                  "Running inference workloads on Cloudflare Workers, WASM, and ONNX Runtime: sub-100ms predictions without a central server.",                                             DT(2025,6,11,13,0),  DT(2025,6,11,14,0),  "Hall C",      120, "Talk",     "Advanced");

        // Sold-out session: Capacity=2 and gets exactly 2 registrations below
        var s25_soldOut = new Session
        {
            TrackId     = t25Arch.Id,
            Title       = "Event Sourcing and CQRS in Practice",
            Description = "A highly sought-after hands-on session: model a domain from scratch using Event Sourcing, build read models with projections, and handle eventual consistency. Limited seats.",
            StartTime   = DT(2025,6,11,10,30),
            EndTime     = DT(2025,6,11,12,0),
            Room        = "Workshop C",
            Capacity    = 2,
            SessionType = "Workshop",
            Level       = "Advanced",
        };

        var s25_12 = MakeSession(t25Arch.Id,     "Domain-Driven Design in 2025",                        "Aggregate design, bounded contexts, and how modern DDD practitioners adapt tactical patterns for cloud-native, event-driven systems.",                                     DT(2025,6,11,13,0),  DT(2025,6,11,14,0),  "Hall B",      120, "Talk",     "Intermediate");
        var s25_13 = MakeSession(t25Arch.Id,     "Microservices vs Modular Monolith",                   "An honest comparison: when to break apart your monolith, when to keep it together, and how to evolve your architecture incrementally.",                                   DT(2025,6,12,10,30), DT(2025,6,12,11,30), "Hall A",      200, "Talk",     "Intermediate");
        var s25_14 = MakeSession(t25Backend.Id,  "Closing Keynote: AI-Augmented Development",           "How LLMs, copilots, and AI-driven testing are reshaping the software development lifecycle: and what it means for your career.",                                          DT(2025,6,12,16,0),  DT(2025,6,12,17,0),  "Main Stage",  500, "Keynote",  "All");

        // ── TechConf 2026 sessions (14) ───────────────────────────────────────
        var s26_01 = MakeSession(t26Backend.Id,  "Keynote: The Next Chapter of Cloud Native .NET",      "A preview of .NET 11 and the future of Aspire: smarter orchestration, integrated observability, and AI-first service defaults.",                                          DT(2026,6,15,9,0),   DT(2026,6,15,10,0),  "Main Stage",  500, "Keynote",  "All");
        var s26_02 = MakeSession(t26Backend.Id,  "Building Scalable APIs with .NET Aspire",             "Advanced patterns for production Aspire deployments: health checks, distributed tracing, secrets management, and multi-cloud targeting.",                                 DT(2026,6,15,10,30), DT(2026,6,15,11,30), "Hall A",      200, "Talk",     "Intermediate");
        var s26_03 = MakeSession(t26Backend.Id,  "High-Performance C# with System.Threading.Channels", "Lock-free producer-consumer patterns, backpressure, and building sub-millisecond data pipelines in C# 14.",                                                               DT(2026,6,15,13,0),  DT(2026,6,15,14,0),  "Hall A",      200, "Talk",     "Advanced");
        var s26_04 = MakeSession(t26Frontend.Id, "React 19 and the New Concurrency Model",              "What changed in React 19: the revised concurrent scheduler, use() hook, and new form actions. Live migration from React 18.",                                            DT(2026,6,15,10,30), DT(2026,6,15,11,30), "Hall B",      150, "Talk",     "Intermediate");
        var s26_05 = MakeSession(t26Frontend.Id, "Edge Rendering with Next.js 15",                      "Deploying Next.js 15 to Vercel Edge, Cloudflare Pages, and AWS Lambda@Edge: performance, caching, and ISR deep dive.",                                                  DT(2026,6,15,13,0),  DT(2026,6,15,14,0),  "Hall B",      150, "Talk",     "Advanced");
        var s26_06 = MakeSession(t26DevOps.Id,   "Internal Developer Platforms from Scratch",           "Design and build an IDP with Backstage, Crossplane, and GitHub Actions. Cover golden paths, self-service infra, and metrics.",                                           DT(2026,6,15,10,30), DT(2026,6,15,12,0),  "Workshop A",   40, "Workshop", "Intermediate");
        var s26_07 = MakeSession(t26DevOps.Id,   "FinOps: Cloud Cost Engineering",                      "Unit economics, rightsizing, spot strategies, and how platform teams can build a culture of cost ownership across engineering.",                                          DT(2026,6,15,13,0),  DT(2026,6,15,14,0),  "Hall C",      120, "Talk",     "Intermediate");
        var s26_08 = MakeSession(t26Security.Id, "Post-Quantum Cryptography in Practice",               "NIST PQC standards (CRYSTALS-Kyber, CRYSTALS-Dilithium) and a practical guide to migrating TLS and signing pipelines.",                                                 DT(2026,6,16,10,30), DT(2026,6,16,11,30), "Hall A",      180, "Talk",     "Advanced");
        var s26_09 = MakeSession(t26Security.Id, "AI-Driven Threat Detection",                          "Using ML models for anomaly detection in API traffic, building adaptive rate-limiting, and integrating with SIEM pipelines.",                                             DT(2026,6,16,13,0),  DT(2026,6,16,14,0),  "Hall A",      180, "Talk",     "Intermediate");
        var s26_10 = MakeSession(t26Data.Id,     "Production RAG Systems at Scale",                     "Lessons from running RAG in production: chunking strategies, embedding model selection, hybrid search, and evaluation pipelines.",                                        DT(2026,6,16,10,30), DT(2026,6,16,12,0),  "Workshop B",   40, "Workshop", "Advanced");
        var s26_11 = MakeSession(t26Data.Id,     "Fine-Tuning LLMs for Enterprise Use Cases",           "When to fine-tune vs RAG, dataset curation, LoRA/QLoRA techniques, and deploying custom models on Azure OpenAI and AWS Bedrock.",                                        DT(2026,6,16,13,0),  DT(2026,6,16,14,0),  "Hall C",      120, "Talk",     "Advanced");
        var s26_12 = MakeSession(t26Platform.Id, "Golden Paths: Opinionated Platforms Developers Love", "Case studies from Spotify, LinkedIn, and Airbnb on building golden paths that balance guardrails with developer autonomy.",                                               DT(2026,6,16,10,30), DT(2026,6,16,11,30), "Hall B",      150, "Talk",     "Intermediate");
        var s26_13 = MakeSession(t26Platform.Id, "Platform Metrics and Developer Productivity",         "DORA metrics, SPACE framework, and how to instrument your IDP to generate evidence-based conversations with leadership.",                                                 DT(2026,6,16,13,0),  DT(2026,6,16,14,0),  "Hall B",      150, "Talk",     "Intermediate");
        var s26_14 = MakeSession(t26Backend.Id,  "Closing Keynote: Developers and the AI Future",       "How the industry is adapting to AI-native development: from prompt engineering as a skill to AI pair programmers in production teams.",                                   DT(2026,6,16,16,0),  DT(2026,6,16,17,0),  "Main Stage",  500, "Keynote",  "All");

        db.Sessions.AddRange(
            s23_01, s23_02, s23_03, s23_04, s23_05, s23_06, s23_07,
            s23_08, s23_09, s23_10, s23_11, s23_12, s23_13, s23_14,
            s25_01, s25_02, s25_03, s25_04, s25_05, s25_06, s25_07,
            s25_08, s25_09, s25_10, s25_11, s25_soldOut, s25_12, s25_13, s25_14,
            s26_01, s26_02, s26_03, s26_04, s26_05, s26_06, s26_07,
            s26_08, s26_09, s26_10, s26_11, s26_12, s26_13, s26_14
        );

        // ── SessionSpeaker assignments ────────────────────────────────────────
        db.SessionSpeakers.AddRange(
            // TechConf 2023
            new SessionSpeaker { SessionId = s23_01.Id, SpeakerId = spCarol.Id },
            new SessionSpeaker { SessionId = s23_02.Id, SpeakerId = spAlice.Id },
            new SessionSpeaker { SessionId = s23_03.Id, SpeakerId = spQuinn.Id },
            new SessionSpeaker { SessionId = s23_04.Id, SpeakerId = spBob.Id },
            new SessionSpeaker { SessionId = s23_05.Id, SpeakerId = spKate.Id },
            new SessionSpeaker { SessionId = s23_06.Id, SpeakerId = spJames.Id },
            new SessionSpeaker { SessionId = s23_07.Id, SpeakerId = spDavid.Id },
            new SessionSpeaker { SessionId = s23_08.Id, SpeakerId = spMia.Id },
            new SessionSpeaker { SessionId = s23_09.Id, SpeakerId = spPatrick.Id },
            new SessionSpeaker { SessionId = s23_10.Id, SpeakerId = spFrank.Id },
            new SessionSpeaker { SessionId = s23_11.Id, SpeakerId = spEmma.Id },
            new SessionSpeaker { SessionId = s23_12.Id, SpeakerId = spIsabella.Id },
            new SessionSpeaker { SessionId = s23_13.Id, SpeakerId = spOlivia.Id },
            new SessionSpeaker { SessionId = s23_14.Id, SpeakerId = spCarol.Id },
            new SessionSpeaker { SessionId = s23_14.Id, SpeakerId = spDavid.Id },
            // DevSummit 2025
            new SessionSpeaker { SessionId = s25_01.Id, SpeakerId = spCarol.Id },
            new SessionSpeaker { SessionId = s25_01.Id, SpeakerId = spEmma.Id },
            new SessionSpeaker { SessionId = s25_02.Id, SpeakerId = spAlice.Id },
            new SessionSpeaker { SessionId = s25_03.Id, SpeakerId = spQuinn.Id },
            new SessionSpeaker { SessionId = s25_04.Id, SpeakerId = spGrace.Id },
            new SessionSpeaker { SessionId = s25_05.Id, SpeakerId = spKate.Id },
            new SessionSpeaker { SessionId = s25_06.Id, SpeakerId = spJames.Id },
            new SessionSpeaker { SessionId = s25_07.Id, SpeakerId = spDavid.Id },
            new SessionSpeaker { SessionId = s25_08.Id, SpeakerId = spMia.Id },
            new SessionSpeaker { SessionId = s25_09.Id, SpeakerId = spHenry.Id },
            new SessionSpeaker { SessionId = s25_10.Id, SpeakerId = spFrank.Id },
            new SessionSpeaker { SessionId = s25_11.Id, SpeakerId = spMia.Id },
            new SessionSpeaker { SessionId = s25_soldOut.Id, SpeakerId = spHenry.Id },
            new SessionSpeaker { SessionId = s25_12.Id, SpeakerId = spPatrick.Id },
            new SessionSpeaker { SessionId = s25_13.Id, SpeakerId = spAlice.Id },
            new SessionSpeaker { SessionId = s25_14.Id, SpeakerId = spCarol.Id },
            // TechConf 2026
            new SessionSpeaker { SessionId = s26_01.Id, SpeakerId = spCarol.Id },
            new SessionSpeaker { SessionId = s26_01.Id, SpeakerId = spNoah.Id },
            new SessionSpeaker { SessionId = s26_02.Id, SpeakerId = spAlice.Id },
            new SessionSpeaker { SessionId = s26_03.Id, SpeakerId = spCarol.Id },
            new SessionSpeaker { SessionId = s26_04.Id, SpeakerId = spGrace.Id },
            new SessionSpeaker { SessionId = s26_05.Id, SpeakerId = spKate.Id },
            new SessionSpeaker { SessionId = s26_06.Id, SpeakerId = spLiam.Id },
            new SessionSpeaker { SessionId = s26_07.Id, SpeakerId = spEmma.Id },
            new SessionSpeaker { SessionId = s26_08.Id, SpeakerId = spMia.Id },
            new SessionSpeaker { SessionId = s26_09.Id, SpeakerId = spFrank.Id },
            new SessionSpeaker { SessionId = s26_10.Id, SpeakerId = spQuinn.Id },
            new SessionSpeaker { SessionId = s26_11.Id, SpeakerId = spEmma.Id },
            new SessionSpeaker { SessionId = s26_12.Id, SpeakerId = spJames.Id },
            new SessionSpeaker { SessionId = s26_13.Id, SpeakerId = spPatrick.Id },
            new SessionSpeaker { SessionId = s26_14.Id, SpeakerId = spBob.Id },
            new SessionSpeaker { SessionId = s26_14.Id, SpeakerId = spGrace.Id }
        );

        await db.SaveChangesAsync();

        // ── Registrations ─────────────────────────────────────────────────────
        // user1: 5 sessions in DevSummit 2025 (includes the sold-out workshop)
        // user2: 1 session — the sold-out workshop (fills capacity=2)
        // user3: 1 regular session in DevSummit 2025
        var user1Id = seededUserIds["user1@test.dev"];
        var user2Id = seededUserIds["user2@test.dev"];
        var user3Id = seededUserIds["user3@test.dev"];

        db.Registrations.AddRange(
            new Registration { UserId = user1Id, SessionId = s25_soldOut.Id, RegisteredAt = DateTime.UtcNow },
            new Registration { UserId = user1Id, SessionId = s25_02.Id,      RegisteredAt = DateTime.UtcNow },
            new Registration { UserId = user1Id, SessionId = s25_04.Id,      RegisteredAt = DateTime.UtcNow },
            new Registration { UserId = user1Id, SessionId = s25_07.Id,      RegisteredAt = DateTime.UtcNow },
            new Registration { UserId = user1Id, SessionId = s25_09.Id,      RegisteredAt = DateTime.UtcNow },
            // user2 fills the sold-out session (Capacity=2 => 2 registrations = sold out)
            new Registration { UserId = user2Id, SessionId = s25_soldOut.Id, RegisteredAt = DateTime.UtcNow },
            // user3 registers for a regular session
            new Registration { UserId = user3Id, SessionId = s25_05.Id,      RegisteredAt = DateTime.UtcNow }
        );

        await db.SaveChangesAsync();
    }
}
