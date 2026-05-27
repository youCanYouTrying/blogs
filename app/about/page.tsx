export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
      <div className="border-b border-stone-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          About
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          把技术、写作和日常观察慢慢连起来。
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          这里记录长期主义的工作方法，也记录那些短暂但值得留下的想法。比起追逐热点，我更关心能否把复杂问题讲清楚、把页面打磨得自然。
        </p>
      </div>

      <div className="mt-10 space-y-10 text-[1.02rem] leading-8 text-stone-700">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            我在写什么
          </h2>
          <p>
            文章会围绕前端工程、产品细节、个人项目和写作习惯展开。技术内容会尽量贴近真实开发现场，少一些教程腔，多一些实际取舍。
          </p>
          <p>
            我也会写非技术主题，例如如何建立稳定节奏、如何让长期项目持续推进，以及为什么很多体验问题本质上是信息组织问题。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            我在意什么
          </h2>
          <p>
            我偏爱克制而清楚的界面，重视排版、留白和节奏感。一个页面是否舒服，往往不在于视觉技巧有多炫，而在于阅读路线是否顺手、信息是否被妥善安排。
          </p>
          <p>
            同样地，我也在意代码的可维护性。好代码不只是“能跑”，还应该能被下一次修改温和地接住。
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            这座博客
          </h2>
          <p>
            这不是一个为了堆功能而存在的网站。它更像一间长期更新的工作室，文章、想法、实验和归档会在这里慢慢积累，形成可回看的轨迹。
          </p>
          <p>
            如果某篇文章让你想到别的实现方式，或者你也在做相似的项目，欢迎在评论区留下线索。
          </p>
        </section>
      </div>
    </main>
  );
}
