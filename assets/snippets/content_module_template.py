# -*- coding: utf-8 -*-
"""第 <序> 章 <章节主题>。

用法：复制本文件为 content_<序>_<主题>.py，然后在 build.py 的导入区与 main() 模块列表两处注册。
规范：rules/business-analysis.md（管线不变量）、rules/tech.md（Word 实现）、rules/writing.md（事实分标）。
注意：正文中的 ASCII 双引号会由 docx_kit.zh() 自动转为弯引号，直接写 " 即可。

可用 DSL（全部来自 docx_kit.ReportBuilder，勿直接操作 python-docx）：
    b.h(text, level=1|2|3, page_break=False)      标题（level=1 自动加下边框）
    b.para(text, after=4, bold=False, ...)         正文段落
    b.bullet(text, level=0, bold_head=None)        无序列表
    b.numbered(text, bold_head=None)               有序列表（判断一　/ 判断二 …）
    b.table(header, rows, widths=[...], caption=..) 表格（自动编号「表 N」）
    b.callout(text, title=None)                    强调块（用于定义、结论）
    b.note(text)                                   小字注释（口径、免责说明）
    b.page_break()                                 分页
"""


def build(b):
    b.h('<章标题>', level=1)

    b.para('<先给判断，再给依据。每个数字带【硬】/【经】/【假设】/【估】标记。>', after=6)

    b.callout('<一句话结论>', title='<结论标签>')

    b.h('<小节标题>', level=2)
    b.para('<依据说明>。', after=6)

    b.table(
        ['维度', '结论', '依据'],
        [
            ['<维度一>', '<结论>', '<依据，含来源与可信度标记>'],
            ['<维度二>', '<结论>', '<依据>'],
        ],
        widths=[1.6, 1.4, 5.4],
        caption='<表题（自动编号，不写"表 N"）>',
    )

    b.numbered('<第 1 条判断，先结论后依据>', bold_head='判断一　')
    b.numbered('<第 2 条判断>', bold_head='判断二　')

    b.note('<口径说明、假设条件或数据限制；未核实项须在此写明。>')