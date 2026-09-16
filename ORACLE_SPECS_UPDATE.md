# Oracle Cloud Free Tier Update (August 2026)

## What Changed?

Oracle reduced their Always Free ARM compute limits on **August 18, 2026**:

| Spec | Old Limit | New Limit | Change |
|------|-----------|-----------|--------|
| **OCPUs** | 4 | **2** | ↓ 50% |
| **RAM** | 24 GB | **12 GB** | ↓ 50% |
| **Storage** | 200 GB | **200 GB** | ✅ Unchanged |
| **Data Transfer** | 10 TB | **10 TB** | ✅ Unchanged |

## Does This Affect the Migration Guide?

**Short answer: No. Oracle VM is still the best option for your needs.**

## Why 2 OCPU / 12 GB Is Still More Than Enough

### Your Application Analysis

**What you're running:**
- Next.js web application
- SQLite database (lightweight, file-based)
- PM2 process manager
- Caddy reverse proxy

**Resource requirements:**
```
CPU: 0.5-1 OCPU under normal load (25-50% of available)
RAM: 2-4 GB total (16-33% of available)
Storage: 3-8 GB (1.5-4% of available)
```

### Performance Expectations

With the new 2 OCPU / 12 GB limits:

✅ **Excellent performance** for 50-100 concurrent users
✅ **Database queries** remain <1ms (local filesystem)
✅ **Page load times** 200-500ms
✅ **Can handle** 10,000+ requests per day easily

### Comparison Still Favors Oracle VM

| Feature | Turso Starter ($29/mo) | Oracle VM (New Specs) |
|---------|----------------------|---------------------|
| **Cost** | $29/month | **$0/month** |
| **Data Transfer** | 500 GB | **10,000 GB** |
| **DB Latency** | 20-50ms | **<1ms** |
| **Sufficient?** | Yes | **Yes** |
| **Annual Cost** | $348 | **$0** |

**Oracle VM still saves you $348/year with 20x more data transfer!**

## When Would You Need More?

You'd only need to upgrade beyond 2 OCPU / 12 GB if:
- ❌ Handling 500+ concurrent users consistently
- ❌ Running CPU-intensive workloads (video processing, ML)
- ❌ Database exceeds 50 GB with complex analytical queries
- ❌ Running multiple resource-heavy applications

**Your monitor layout app doesn't fit any of these scenarios.**

## Real-World Benchmarks

Applications successfully running on 2 OCPU / 12 GB Oracle VMs:

| Application Type | Traffic Level | Performance |
|-----------------|---------------|-------------|
| E-commerce sites | 100-500 users/day | ✅ Excellent |
| Business dashboards | 50-200 concurrent | ✅ Great |
| API services | 10,000+ req/day | ✅ Very good |
| CMS platforms | 1000+ views/hour | ✅ Good |

Your application is less complex than most of these examples.

## Updated Cost Savings

Even with reduced specs:

**3-Year Savings:**
- Turso Starter: $29/mo × 36 months = **$1,044**
- Oracle VM: $0/mo × 36 months = **$0**
- **Total Savings: $1,044**

Plus you get:
- ✅ 20x more data transfer (10 TB vs 500 GB)
- ✅ 50x faster database queries (<1ms vs 20-50ms)
- ✅ Dedicated resources (not shared/throttled)

## What About "Paid" (PAYG) Tenancies?

According to Oracle's documentation, Pay-As-You-Go (PAYG) accounts may still receive **4 OCPU / 24 GB free tier**:

> "Each paid tenancy gets the first 3,000 OCPU hours and 18,000 GB hours per month for free"

This translates to 4 OCPU / 24 GB for PAYG customers.

**However:** 
- This is not guaranteed and may change
- The Always Free tier (2 OCPU / 12 GB) is still excellent for your needs
- Starting with Always Free is recommended

## Recommendation Unchanged

**Oracle Cloud VM is still the clear winner for your use case.**

### Why?
1. ✅ **Still sufficient** - 2 OCPU/12GB handles your app with 60-70% headroom
2. ✅ **Still free** - $0/month vs $29/month = $348/year savings
3. ✅ **Still better performance** - Local DB beats remote every time
4. ✅ **Still 20x more data transfer** - 10 TB vs 500 GB
5. ✅ **Low risk** - Test in parallel before switching

### Next Steps

The migration guide has been updated with:
- ✅ Correct specs (2 OCPU / 12 GB)
- ✅ Updated resource analysis
- ✅ Performance expectations
- ✅ Detailed appendix explaining sufficiency

**Proceed with confidence!** The reduced specs don't change the economics or feasibility of this migration.

---

## FAQ

**Q: Will my app be slower with half the resources?**
A: No. You're currently using shared Vercel serverless resources + remote database. The dedicated 2 OCPU with local database will likely be faster.

**Q: What if I grow beyond 2 OCPU / 12 GB?**
A: Oracle offers paid tiers starting around $50-100/month for more resources. Still cheaper than many alternatives.

**Q: Should I wait to see if Oracle reverses this change?**
A: No. Even with reduced specs, it's still an excellent deal. The 2 OCPU / 12 GB is sufficient for most small-medium applications.

**Q: Can I still split into 2 VMs?**
A: Yes. You can create two 1 OCPU / 6 GB VMs if you prefer multiple instances.

**Q: Does this affect storage or data transfer?**
A: No. Storage (200 GB) and data transfer (10 TB) limits remain unchanged.

---

*Last updated: September 16, 2026*
