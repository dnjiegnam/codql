function stringToBool(t) {
    return "true" === (t + "").toLowerCase();
}
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function clearFileInput(t) {
    if (t.value) {
        var e, a, n;
        try {
            t.value = "";
        } catch (i) {}
        t.value && ((e = document.createElement("form")), (a = t.parentNode), (n = t.nextSibling), e.appendChild(t), e.reset(), a.insertBefore(t, n));
    }
}
!(function (t, e) {
    "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? (module.exports = e()) : (t.Autolinker = e());
})(this, function () {
    var t, e, a;
    function n(t) {
        (this.urls = this.normalizeUrlsCfg((t = t || {}).urls)),
            (this.email = "boolean" != typeof t.email || t.email),
            (this.twitter = "boolean" != typeof t.twitter || t.twitter),
            (this.phone = "boolean" != typeof t.phone || t.phone),
            (this.hashtag = t.hashtag || !1),
            (this.newWindow = "boolean" != typeof t.newWindow || t.newWindow),
            (this.stripPrefix = "boolean" != typeof t.stripPrefix || t.stripPrefix);
        var e = this.hashtag;
        if (!1 !== e && "twitter" !== e && "facebook" !== e && "instagram" !== e) throw Error("invalid `hashtag` cfg - see docs");
        (this.truncate = this.normalizeTruncateCfg(t.truncate)), (this.className = t.className || ""), (this.replaceFn = t.replaceFn || null), (this.htmlParser = null), (this.matchers = null), (this.tagBuilder = null);
    }
    return (
        (n.prototype = {
            constructor: n,
            normalizeUrlsCfg: function (t) {
                return "boolean" == typeof (t = null == t || t)
                    ? { schemeMatches: t, wwwMatches: t, tldMatches: t }
                    : { schemeMatches: "boolean" != typeof t.schemeMatches || t.schemeMatches, wwwMatches: "boolean" != typeof t.wwwMatches || t.wwwMatches, tldMatches: "boolean" != typeof t.tldMatches || t.tldMatches };
            },
            normalizeTruncateCfg: function (t) {
                return "number" == typeof t ? { length: t, location: "end" } : n.Util.defaults(t || {}, { length: Number.POSITIVE_INFINITY, location: "end" });
            },
            parse: function (t) {
                for (var e = this.getHtmlParser().parse(t), a = 0, n = [], i = 0, r = e.length; i < r; i++) {
                    var o = e[i],
                        s = o.getType();
                    "element" === s && "a" === o.getTagName() ? (o.isClosing() ? (a = Math.max(a - 1, 0)) : a++) : "text" === s && 0 === a && ((o = this.parseText(o.getText(), o.getOffset())), n.push.apply(n, o));
                }
                return (n = this.compactMatches(n)), this.removeUnwantedMatches(n);
            },
            compactMatches: function (t) {
                t.sort(function (t, e) {
                    return t.getOffset() - e.getOffset();
                });
                for (var e = 0; e < t.length - 1; e++) for (var a = t[e], n = a.getOffset() + a.getMatchedText().length; e + 1 < t.length && t[e + 1].getOffset() <= n; ) t.splice(e + 1, 1);
                return t;
            },
            removeUnwantedMatches: function (t) {
                var e = n.Util.remove;
                return (
                    this.hashtag ||
                        e(t, function (t) {
                            return "hashtag" === t.getType();
                        }),
                    this.email ||
                        e(t, function (t) {
                            return "email" === t.getType();
                        }),
                    this.phone ||
                        e(t, function (t) {
                            return "phone" === t.getType();
                        }),
                    this.twitter ||
                        e(t, function (t) {
                            return "twitter" === t.getType();
                        }),
                    this.urls.schemeMatches ||
                        e(t, function (t) {
                            return "url" === t.getType() && "scheme" === t.getUrlMatchType();
                        }),
                    this.urls.wwwMatches ||
                        e(t, function (t) {
                            return "url" === t.getType() && "www" === t.getUrlMatchType();
                        }),
                    this.urls.tldMatches ||
                        e(t, function (t) {
                            return "url" === t.getType() && "tld" === t.getUrlMatchType();
                        }),
                    t
                );
            },
            parseText: function (t, e) {
                e = e || 0;
                for (var a = this.getMatchers(), n = [], i = 0, r = a.length; i < r; i++) {
                    for (var o = a[i].parseMatches(t), s = 0, l = o.length; s < l; s++) o[s].setOffset(e + o[s].getOffset());
                    n.push.apply(n, o);
                }
                return n;
            },
            link: function (t) {
                if (!t) return "";
                for (var e = this.parse(t), a = [], n = 0, i = 0, r = e.length; i < r; i++) {
                    var o = e[i];
                    a.push(t.substring(n, o.getOffset())), a.push(this.createMatchReturnVal(o)), (n = o.getOffset() + o.getMatchedText().length);
                }
                return a.push(t.substring(n)), a.join("");
            },
            createMatchReturnVal: function (t) {
                var e;
                return "string" == typeof (e = this.replaceFn ? this.replaceFn.call(this, this, t) : e) ? e : !1 === e ? t.getMatchedText() : (e instanceof n.HtmlTag ? e : t.buildTag()).toAnchorString();
            },
            getHtmlParser: function () {
                return this.htmlParser || (this.htmlParser = new n.htmlParser.HtmlParser());
            },
            getMatchers: function () {
                if (this.matchers) return this.matchers;
                var t = n.matcher,
                    e = this.getTagBuilder();
                return (
                    (e = [
                        new t.Hashtag({ tagBuilder: e, serviceName: this.hashtag }),
                        new t.Email({ tagBuilder: e }),
                        new t.Phone({ tagBuilder: e }),
                        new t.Twitter({ tagBuilder: e }),
                        new t.Url({ tagBuilder: e, stripPrefix: this.stripPrefix }),
                    ]),
                    (this.matchers = e)
                );
            },
            getTagBuilder: function () {
                return this.tagBuilder || (this.tagBuilder = new n.AnchorTagBuilder({ newWindow: this.newWindow, truncate: this.truncate, className: this.className }));
            },
        }),
        (n.link = function (t, e) {
            return new n(e).link(t);
        }),
        (n.match = {}),
        (n.matcher = {}),
        (n.htmlParser = {}),
        (n.truncate = {}),
        (n.Util = {
            abstractMethod: function () {
                throw "abstract";
            },
            trimRegex: /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
            assign: function (t, e) {
                for (var a in e) e.hasOwnProperty(a) && (t[a] = e[a]);
                return t;
            },
            defaults: function (t, e) {
                for (var a in e) e.hasOwnProperty(a) && void 0 === t[a] && (t[a] = e[a]);
                return t;
            },
            extend: function (t, e) {
                var a = t.prototype,
                    i = function () {};
                return (
                    (i.prototype = a),
                    ((i = (t = e.hasOwnProperty("constructor")
                        ? e.constructor
                        : function () {
                              a.constructor.apply(this, arguments);
                          }).prototype = new i()).constructor = t),
                    (i.superclass = a),
                    delete e.constructor,
                    n.Util.assign(i, e),
                    t
                );
            },
            ellipsis: function (t, e, a) {
                return t.length > e ? t.substring(0, e - (a = null == a ? ".." : a).length) + a : t;
            },
            indexOf: function (t, e) {
                if (Array.prototype.indexOf) return t.indexOf(e);
                for (var a = 0, n = t.length; a < n; a++) if (t[a] === e) return a;
                return -1;
            },
            remove: function (t, e) {
                for (var a = t.length - 1; 0 <= a; a--) !0 === e(t[a]) && t.splice(a, 1);
            },
            splitAndCapture: function (t, e) {
                for (var a, n = [], i = 0; (a = e.exec(t)); ) n.push(t.substring(i, a.index)), n.push(a[0]), (i = a.index + a[0].length);
                return n.push(t.substring(i)), n;
            },
            trim: function (t) {
                return t.replace(this.trimRegex, "");
            },
        }),
        (n.HtmlTag = n.Util.extend(Object, {
            whitespaceRegex: /\s+/,
            constructor: function (t) {
                n.Util.assign(this, t), (this.innerHtml = this.innerHtml || this.innerHTML);
            },
            setTagName: function (t) {
                return (this.tagName = t), this;
            },
            getTagName: function () {
                return this.tagName || "";
            },
            setAttr: function (t, e) {
                return (this.getAttrs()[t] = e), this;
            },
            getAttr: function (t) {
                return this.getAttrs()[t];
            },
            setAttrs: function (t) {
                var e = this.getAttrs();
                return n.Util.assign(e, t), this;
            },
            getAttrs: function () {
                return this.attrs || (this.attrs = {});
            },
            setClass: function (t) {
                return this.setAttr("class", t);
            },
            addClass: function (t) {
                for (var e, a = this.getClass(), i = this.whitespaceRegex, r = n.Util.indexOf, o = a ? a.split(i) : [], s = t.split(i); (e = s.shift()); ) -1 === r(o, e) && o.push(e);
                return (this.getAttrs().class = o.join(" ")), this;
            },
            removeClass: function (t) {
                for (var e, a = this.getClass(), i = this.whitespaceRegex, r = n.Util.indexOf, o = a ? a.split(i) : [], s = t.split(i); o.length && (e = s.shift()); ) {
                    var l = r(o, e);
                    -1 !== l && o.splice(l, 1);
                }
                return (this.getAttrs().class = o.join(" ")), this;
            },
            getClass: function () {
                return this.getAttrs().class || "";
            },
            hasClass: function (t) {
                return -1 !== (" " + this.getClass() + " ").indexOf(" " + t + " ");
            },
            setInnerHtml: function (t) {
                return (this.innerHtml = t), this;
            },
            getInnerHtml: function () {
                return this.innerHtml || "";
            },
            toAnchorString: function () {
                var t = this.getTagName(),
                    e = this.buildAttrsStr();
                return ["<", t, (e = e ? " " + e : ""), ">", this.getInnerHtml(), "</", t, ">"].join("");
            },
            buildAttrsStr: function () {
                if (!this.attrs) return "";
                var t,
                    e = this.getAttrs(),
                    a = [];
                for (t in e) e.hasOwnProperty(t) && a.push(t + '="' + e[t] + '"');
                return a.join(" ");
            },
        })),
        (n.RegexLib = {
            alphaNumericCharsStr: (a =
                "A-Za-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛱ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ0-9٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯෦-෯๐-๙໐-໙༠-༩၀-၉႐-႙០-៩᠐-᠙᥆-᥏᧐-᧙᪀-᪉᪐-᪙᭐-᭙᮰-᮹᱀-᱉᱐-᱙꘠-꘩꣐-꣙꤀-꤉꧐-꧙꧰-꧹꩐-꩙꯰-꯹０-９"),
            domainNameRegex: RegExp("[" + a + ".\\-]*[" + a + "\\-]"),
            tldRegex: /(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|press|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,
        }),
        (n.AnchorTagBuilder = n.Util.extend(Object, {
            constructor: function (t) {
                n.Util.assign(this, t);
            },
            build: function (t) {
                return new n.HtmlTag({ tagName: "a", attrs: this.createAttrs(t.getType(), t.getAnchorHref()), innerHtml: this.processAnchorText(t.getAnchorText()) });
            },
            createAttrs: function (t, e) {
                return (e = { href: e }), (t = this.createCssClass(t)) && (e.class = t), this.newWindow && (e.target = "_blank"), e;
            },
            createCssClass: function (t) {
                var e = this.className;
                return e ? e + " " + e + "-" + t : "";
            },
            processAnchorText: function (t) {
                return this.doTruncate(t);
            },
            doTruncate: function (t) {
                if (!(e = this.truncate)) return t;
                var e,
                    a = e.length;
                return "smart" === (e = e.location) ? n.truncate.TruncateSmart(t, a, "..") : "middle" === e ? n.truncate.TruncateMiddle(t, a, "..") : n.truncate.TruncateEnd(t, a, "..");
            },
        })),
        (n.htmlParser.HtmlParser = n.Util.extend(Object, {
            htmlRegex: RegExp(
                [
                    "(?:",
                    "<(!DOCTYPE)",
                    "(?:",
                    "\\s+",
                    "(?:",
                    (e = /[^\s\0"'>\/=\x01-\x1F\x7F]+/.source + "(?:\\s*=\\s*" + (t = /(?:"[^"]*?"|'[^']*?'|[^'"=<>`\s]+)/).source + ")?"),
                    "|",
                    t.source + ")",
                    ")*",
                    ">",
                    ")",
                    "|",
                    "(?:",
                    "<(/)?",
                    "(?:",
                    /!--([\s\S]+?)--/.source,
                    "|",
                    "(?:",
                    "(" + /[0-9a-zA-Z][0-9a-zA-Z:]*/.source + ")",
                    "(?:",
                    "\\s*",
                    e,
                    ")*",
                    "\\s*/?",
                    ")",
                    ")",
                    ">",
                    ")",
                ].join(""),
                "gi"
            ),
            htmlCharacterEntitiesRegex: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi,
            parse: function (t) {
                for (var e, a, n = this.htmlRegex, i = 0, r = []; null !== (d = n.exec(t)); ) {
                    var o = d[0],
                        s = d[3],
                        l = d[1] || d[4],
                        c = !!d[2],
                        h = d.index,
                        d = t.substring(i, h);
                    d && ((e = this.parseTextAndEntityNodes(i, d)), r.push.apply(r, e)), s ? r.push(this.createCommentNode(h, o, s)) : r.push(this.createElementNode(h, o, l, c)), (i = h + o.length);
                }
                return i < t.length && (a = t.substring(i)) && ((e = this.parseTextAndEntityNodes(i, a)), r.push.apply(r, e)), r;
            },
            parseTextAndEntityNodes: function (t, e) {
                for (var a = [], i = n.Util.splitAndCapture(e, this.htmlCharacterEntitiesRegex), r = 0, o = i.length; r < o; r += 2) {
                    var s = i[r],
                        l = i[r + 1];
                    s && (a.push(this.createTextNode(t, s)), (t += s.length)), l && (a.push(this.createEntityNode(t, l)), (t += l.length));
                }
                return a;
            },
            createCommentNode: function (t, e, a) {
                return new n.htmlParser.CommentNode({ offset: t, text: e, comment: n.Util.trim(a) });
            },
            createElementNode: function (t, e, a, i) {
                return new n.htmlParser.ElementNode({ offset: t, text: e, tagName: a.toLowerCase(), closing: i });
            },
            createEntityNode: function (t, e) {
                return new n.htmlParser.EntityNode({ offset: t, text: e });
            },
            createTextNode: function (t, e) {
                return new n.htmlParser.TextNode({ offset: t, text: e });
            },
        })),
        (n.htmlParser.HtmlNode = n.Util.extend(Object, {
            offset: void 0,
            text: void 0,
            constructor: function (t) {
                n.Util.assign(this, t);
            },
            getType: n.Util.abstractMethod,
            getOffset: function () {
                return this.offset;
            },
            getText: function () {
                return this.text;
            },
        })),
        (n.htmlParser.CommentNode = n.Util.extend(n.htmlParser.HtmlNode, {
            comment: "",
            getType: function () {
                return "comment";
            },
            getComment: function () {
                return this.comment;
            },
        })),
        (n.htmlParser.ElementNode = n.Util.extend(n.htmlParser.HtmlNode, {
            tagName: "",
            closing: !1,
            getType: function () {
                return "element";
            },
            getTagName: function () {
                return this.tagName;
            },
            isClosing: function () {
                return this.closing;
            },
        })),
        (n.htmlParser.EntityNode = n.Util.extend(n.htmlParser.HtmlNode, {
            getType: function () {
                return "entity";
            },
        })),
        (n.htmlParser.TextNode = n.Util.extend(n.htmlParser.HtmlNode, {
            getType: function () {
                return "text";
            },
        })),
        (n.match.Match = n.Util.extend(Object, {
            constructor: function (t) {
                (this.tagBuilder = t.tagBuilder), (this.matchedText = t.matchedText), (this.offset = t.offset);
            },
            getType: n.Util.abstractMethod,
            getMatchedText: function () {
                return this.matchedText;
            },
            setOffset: function (t) {
                this.offset = t;
            },
            getOffset: function () {
                return this.offset;
            },
            getAnchorHref: n.Util.abstractMethod,
            getAnchorText: n.Util.abstractMethod,
            buildTag: function () {
                return this.tagBuilder.build(this);
            },
        })),
        (n.match.Email = n.Util.extend(n.match.Match, {
            constructor: function (t) {
                n.match.Match.prototype.constructor.call(this, t), (this.email = t.email);
            },
            getType: function () {
                return "email";
            },
            getEmail: function () {
                return this.email;
            },
            getAnchorHref: function () {
                return "mailto:" + this.email;
            },
            getAnchorText: function () {
                return this.email;
            },
        })),
        (n.match.Hashtag = n.Util.extend(n.match.Match, {
            constructor: function (t) {
                n.match.Match.prototype.constructor.call(this, t), (this.serviceName = t.serviceName), (this.hashtag = t.hashtag);
            },
            getType: function () {
                return "hashtag";
            },
            getServiceName: function () {
                return this.serviceName;
            },
            getHashtag: function () {
                return this.hashtag;
            },
            getAnchorHref: function () {
                var t = this.serviceName,
                    e = this.hashtag;
                switch (t) {
                    case "twitter":
                        return "https://twitter.com/hashtag/" + e;
                    case "facebook":
                        return "https://www.facebook.com/hashtag/" + e;
                    case "instagram":
                        return "https://instagram.com/explore/tags/" + e;
                    default:
                        throw Error("Unknown service name to point hashtag to: ", t);
                }
            },
            getAnchorText: function () {
                return "#" + this.hashtag;
            },
        })),
        (n.match.Phone = n.Util.extend(n.match.Match, {
            constructor: function (t) {
                n.match.Match.prototype.constructor.call(this, t), (this.number = t.number), (this.plusSign = t.plusSign);
            },
            getType: function () {
                return "phone";
            },
            getNumber: function () {
                return this.number;
            },
            getAnchorHref: function () {
                return "tel:" + (this.plusSign ? "+" : "") + this.number;
            },
            getAnchorText: function () {
                return this.matchedText;
            },
        })),
        (n.match.Twitter = n.Util.extend(n.match.Match, {
            constructor: function (t) {
                n.match.Match.prototype.constructor.call(this, t), (this.twitterHandle = t.twitterHandle);
            },
            getType: function () {
                return "twitter";
            },
            getTwitterHandle: function () {
                return this.twitterHandle;
            },
            getAnchorHref: function () {
                return "https://twitter.com/" + this.twitterHandle;
            },
            getAnchorText: function () {
                return "@" + this.twitterHandle;
            },
        })),
        (n.match.Url = n.Util.extend(n.match.Match, {
            constructor: function (t) {
                n.match.Match.prototype.constructor.call(this, t),
                    (this.urlMatchType = t.urlMatchType),
                    (this.url = t.url),
                    (this.protocolUrlMatch = t.protocolUrlMatch),
                    (this.protocolRelativeMatch = t.protocolRelativeMatch),
                    (this.stripPrefix = t.stripPrefix);
            },
            urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,
            protocolRelativeRegex: /^\/\//,
            protocolPrepended: !1,
            getType: function () {
                return "url";
            },
            getUrlMatchType: function () {
                return this.urlMatchType;
            },
            getUrl: function () {
                var t = this.url;
                return this.protocolRelativeMatch || this.protocolUrlMatch || this.protocolPrepended || ((t = this.url = "http://" + t), (this.protocolPrepended = !0)), t;
            },
            getAnchorHref: function () {
                return this.getUrl().replace(/&amp;/g, "&");
            },
            getAnchorText: function () {
                var t = this.getMatchedText();
                return this.protocolRelativeMatch && (t = this.stripProtocolRelativePrefix(t)), this.stripPrefix && (t = this.stripUrlPrefix(t)), this.removeTrailingSlash(t);
            },
            stripUrlPrefix: function (t) {
                return t.replace(this.urlPrefixRegex, "");
            },
            stripProtocolRelativePrefix: function (t) {
                return t.replace(this.protocolRelativeRegex, "");
            },
            removeTrailingSlash: function (t) {
                return "/" === t.charAt(t.length - 1) ? t.slice(0, -1) : t;
            },
        })),
        (n.matcher.Matcher = n.Util.extend(Object, {
            constructor: function (t) {
                this.tagBuilder = t.tagBuilder;
            },
            parseMatches: n.Util.abstractMethod,
        })),
        (n.matcher.Email = n.Util.extend(n.matcher.Matcher, {
            matcherRegex: ((t = RegExp("[" + (a = n.RegexLib.alphaNumericCharsStr) + "\\-;:&=+$.,]+@")), (e = n.RegexLib.domainNameRegex), (a = n.RegexLib.tldRegex), RegExp([t.source, e.source, "\\.", a.source].join(""), "gi")),
            parseMatches: function (t) {
                for (var e, a = this.matcherRegex, i = this.tagBuilder, r = []; null !== (e = a.exec(t)); ) {
                    var o = e[0];
                    r.push(new n.match.Email({ tagBuilder: i, matchedText: o, offset: e.index, email: o }));
                }
                return r;
            },
        })),
        (n.matcher.Hashtag = n.Util.extend(n.matcher.Matcher, {
            matcherRegex: RegExp("#[_" + n.RegexLib.alphaNumericCharsStr + "]{1,139}", "g"),
            nonWordCharRegex: RegExp("[^" + n.RegexLib.alphaNumericCharsStr + "]"),
            constructor: function (t) {
                n.matcher.Matcher.prototype.constructor.call(this, t), (this.serviceName = t.serviceName);
            },
            parseMatches: function (t) {
                for (var e = this.matcherRegex, a = this.nonWordCharRegex, i = this.serviceName, r = this.tagBuilder, o = []; null !== (s = e.exec(t)); ) {
                    var s,
                        l = s.index,
                        c = t.charAt(l - 1);
                    (0 === l || a.test(c)) && ((c = s[0]), (s = s[0].slice(1)), o.push(new n.match.Hashtag({ tagBuilder: r, matchedText: c, offset: l, serviceName: i, hashtag: s })));
                }
                return o;
            },
        })),
        (n.matcher.Phone = n.Util.extend(n.matcher.Matcher, {
            matcherRegex: /(?:(\+)?\d{1,3}[-\040.])?\(?\d{3}\)?[-\040.]?\d{3}[-\040.]\d{4}/g,
            parseMatches: function (t) {
                for (var e, a = this.matcherRegex, i = this.tagBuilder, r = []; null !== (e = a.exec(t)); ) {
                    var o = e[0],
                        s = o.replace(/\D/g, ""),
                        l = !!e[1];
                    r.push(new n.match.Phone({ tagBuilder: i, matchedText: o, offset: e.index, number: s, plusSign: l }));
                }
                return r;
            },
        })),
        (n.matcher.Twitter = n.Util.extend(n.matcher.Matcher, {
            matcherRegex: RegExp("@[_" + n.RegexLib.alphaNumericCharsStr + "]{1,20}", "g"),
            nonWordCharRegex: RegExp("[^" + n.RegexLib.alphaNumericCharsStr + "]"),
            parseMatches: function (t) {
                for (var e = this.matcherRegex, a = this.nonWordCharRegex, i = this.tagBuilder, r = []; null !== (o = e.exec(t)); ) {
                    var o,
                        s = o.index,
                        l = t.charAt(s - 1);
                    (0 === s || a.test(l)) && ((l = o[0]), (o = o[0].slice(1)), r.push(new n.match.Twitter({ tagBuilder: i, matchedText: l, offset: s, twitterHandle: o })));
                }
                return r;
            },
        })),
        (n.matcher.Url = n.Util.extend(n.matcher.Matcher, {
            matcherRegex:
                ((t = n.RegexLib.domainNameRegex),
                (e = n.RegexLib.tldRegex),
                (a = RegExp("[" + (a = n.RegexLib.alphaNumericCharsStr) + "\\-+&@#/%=~_()|'$*\\[\\]?!:,.;]*[" + a + "\\-+&@#/%=~_()|'$*\\[\\]]")),
                RegExp(
                    [
                        "(?:",
                        "(",
                        /(?:[A-Za-z][-.+A-Za-z0-9]*:(?![A-Za-z][-.+A-Za-z0-9]*:\/\/)(?!\d+\/?)(?:\/\/)?)/.source,
                        t.source,
                        ")",
                        "|",
                        "(",
                        "(//)?",
                        /(?:www\.)/.source,
                        t.source,
                        ")",
                        "|",
                        "(",
                        "(//)?",
                        t.source + "\\.",
                        e.source,
                        ")",
                        ")",
                        "(?:" + a.source + ")?",
                    ].join(""),
                    "gi"
                )),
            wordCharRegExp: /\w/,
            openParensRe: /\(/g,
            closeParensRe: /\)/g,
            constructor: function (t) {
                n.matcher.Matcher.prototype.constructor.call(this, t), (this.stripPrefix = t.stripPrefix);
            },
            parseMatches: function (t) {
                for (var e = this.matcherRegex, a = this.stripPrefix, i = this.tagBuilder, r = []; null !== (d = e.exec(t)); ) {
                    var o = d[0],
                        s = d[1],
                        l = d[2],
                        c = d[3],
                        h = d[5],
                        d = d.index;
                    (c = c || h),
                        (h = t.charAt(d - 1)),
                        n.matcher.UrlMatchValidator.isValid(o, s) &&
                            !((0 < d && "@" === h) || (0 < d && c && this.wordCharRegExp.test(h))) &&
                            (this.matchHasUnbalancedClosingParen(o) ? (o = o.substr(0, o.length - 1)) : -1 < (h = this.matchHasInvalidCharAfterTld(o, s)) && (o = o.substr(0, h)),
                            r.push(new n.match.Url({ tagBuilder: i, matchedText: o, offset: d, urlMatchType: s ? "scheme" : l ? "www" : "tld", url: o, protocolUrlMatch: !!s, protocolRelativeMatch: !!c, stripPrefix: a })));
                }
                return r;
            },
            matchHasUnbalancedClosingParen: function (t) {
                if (")" === t.charAt(t.length - 1)) {
                    var e = t.match(this.openParensRe);
                    if (((t = t.match(this.closeParensRe)), ((e && e.length) || 0) < ((t && t.length) || 0))) return !0;
                }
                return !1;
            },
            matchHasInvalidCharAfterTld: function (t, e) {
                if (!t) return -1;
                var a = 0;
                return (
                    e && ((a = t.indexOf(":")), (t = t.slice(a))),
                    null === (e = /^((.?\/\/)?[A-Za-z0-9\u00C0-\u017F\.\-]*[A-Za-z0-9\u00C0-\u017F\-]\.[A-Za-z]+)/.exec(t)) ? -1 : ((a += e[1].length), (t = t.slice(e[1].length)), /^[^.A-Za-z:\/?#]/.test(t) ? a : -1)
                );
            },
        })),
        (n.matcher.UrlMatchValidator = {
            hasFullProtocolRegex: /^[A-Za-z][-.+A-Za-z0-9]*:\/\//,
            uriSchemeRegex: /^[A-Za-z][-.+A-Za-z0-9]*:/,
            hasWordCharAfterProtocolRegex: /:[^\s]*?[A-Za-z\u00C0-\u017F]/,
            isValid: function (t, e) {
                return !((e && !this.isValidUriScheme(e)) || this.urlMatchDoesNotHaveProtocolOrDot(t, e) || this.urlMatchDoesNotHaveAtLeastOneWordChar(t, e));
            },
            isValidUriScheme: function (t) {
                return "javascript:" !== (t = t.match(this.uriSchemeRegex)[0].toLowerCase()) && "vbscript:" !== t;
            },
            urlMatchDoesNotHaveProtocolOrDot: function (t, e) {
                return !(!t || (e && this.hasFullProtocolRegex.test(e)) || -1 !== t.indexOf("."));
            },
            urlMatchDoesNotHaveAtLeastOneWordChar: function (t, e) {
                return !(!t || !e || this.hasWordCharAfterProtocolRegex.test(t));
            },
        }),
        (n.truncate.TruncateEnd = function (t, e, a) {
            return n.Util.ellipsis(t, e, a);
        }),
        (n.truncate.TruncateMiddle = function (t, e, a) {
            if (t.length <= e) return t;
            var n = e - a.length,
                i = "";
            return 0 < n && (i = t.substr(-1 * Math.floor(n / 2))), (t.substr(0, Math.ceil(n / 2)) + a + i).substr(0, e);
        }),
        (n.truncate.TruncateSmart = function (t, e, a) {
            function n(t, e) {
                var n = e / 2,
                    i = Math.ceil(n);
                return (e = -1 * Math.floor(n)), (n = ""), e < 0 && (n = t.substr(e)), t.substr(0, i) + a + n;
            }
            var i = function (t) {
                var e = "";
                return t.scheme && t.host && (e += t.scheme + "://"), t.host && (e += t.host), t.path && (e += "/" + t.path), t.query && (e += "?" + t.query), t.fragment && (e += "#" + t.fragment), e;
            };
            if (t.length <= e) return t;
            var r,
                o,
                s,
                l = e - a.length,
                c =
                    ((o = {}),
                    (r = (s = r = t).match(/^([a-z]+):\/\//i)) && ((o.scheme = r[1]), (s = s.substr(r[0].length))),
                    (r = s.match(/^(.*?)(?=(\?|#|\/|$))/i)) && ((o.host = r[1]), (s = s.substr(r[0].length))),
                    (r = s.match(/^\/(.*?)(?=(\?|#|$))/i)) && ((o.path = r[1]), (s = s.substr(r[0].length))),
                    (r = s.match(/^\?(.*?)(?=(#|$))/i)) && ((o.query = r[1]), (s = s.substr(r[0].length))),
                    (r = s.match(/^#(.*?)$/i)) && (o.fragment = r[1]),
                    o);
            if ((!c.query || ((h = c.query.match(/^(.*?)(?=(\?|\#))(.*?)$/i)) && ((c.query = c.query.substr(0, h[1].length)), (t = i(c)))), t.length <= e || (c.host && ((c.host = c.host.replace(/^www\./, "")), (t = i(c))), t.length <= e)))
                return t;
            var h = "";
            if ((c.host && (h += c.host), h.length >= l)) return (c.host.length == e ? c.host.substr(0, e - a.length) + a : n(h, l)).substr(0, e);
            if (((i = ""), c.path && (i += "/" + c.path), c.query && (i += "?" + c.query), i)) {
                if (l <= (h + i).length) return (h + i).length == e ? (h + i).substr(0, e) : (h + n(i, l - h.length)).substr(0, e);
                h += i;
            }
            if (c.fragment) {
                if (l <= (h + (i = "#" + c.fragment)).length) return (h + i).length == e ? (h + i).substr(0, e) : (h + n(i, l - h.length)).substr(0, e);
                h += i;
            }
            if (c.scheme && c.host) {
                var d = c.scheme + "://";
                if ((h + d).length < l) return (d + h).substr(0, e);
            }
            return h.length <= e ? h : ((d = ""), 0 < l && (d = h.substr(-1 * Math.floor(l / 2))), (h.substr(0, Math.ceil(l / 2)) + a + d).substr(0, e));
        }),
        n
    );
}),
    (function (t) {
        "use strict";
        function e(t, a) {
            if (!(this instanceof e)) {
                var n = new e(t, a);
                return n.open(), n;
            }
            (this.id = e.id++), this.setup(t, a), this.chainCallbacks(e._callbackChain);
        }
        if (void 0 === t) return "console" in window && window.console.info("Too much lightness, Featherlight needs jQuery.");
        function a(e) {
            return (r = t.grep(r, function (t) {
                return t !== e && 0 < t.$instance.closest("body").length;
            }));
        }
        function n(a) {
            t.each(e.opened().reverse(), function () {
                return a.isDefaultPrevented() || !1 !== this[o[a.type]](a) ? void 0 : (a.preventDefault(), a.stopPropagation(), !1);
            });
        }
        function i(a) {
            var i;
            a !== e._globalHandlerInstalled &&
                ((e._globalHandlerInstalled = a),
                (i = t
                    .map(o, function (t, a) {
                        return a + "." + e.prototype.namespace;
                    })
                    .join(" ")),
                t(window)[a ? "on" : "off"](i, n));
        }
        var r = [],
            o = { keyup: "onKeyUp", resize: "onResize" };
        (e.prototype = {
            constructor: e,
            namespace: "featherlight",
            targetAttr: "data-featherlight",
            variant: null,
            resetCss: !1,
            background: null,
            openTrigger: "click",
            closeTrigger: "click",
            filter: null,
            root: "body",
            openSpeed: 250,
            closeSpeed: 250,
            closeOnClick: "background",
            closeOnEsc: !0,
            closeIcon: "&#10005;",
            loading: "",
            persist: !1,
            otherClose: null,
            beforeOpen: t.noop,
            beforeContent: t.noop,
            beforeClose: t.noop,
            afterOpen: t.noop,
            afterContent: t.noop,
            afterClose: t.noop,
            onKeyUp: t.noop,
            onResize: t.noop,
            type: null,
            contentFilters: ["jquery", "image", "html", "ajax", "iframe", "text"],
            setup: function (e, a) {
                "object" != typeof e || e instanceof t != 0 || a || ((a = e), (e = void 0));
                var n = t.extend(this, a, { target: e }),
                    i =
                        ((e = n.resetCss ? n.namespace + "-reset" : n.namespace),
                        (e = t(
                            n.background ||
                                [
                                    '<div class="' + e + "-loading " + e + '">',
                                    '<div class="' + e + '-content">',
                                    '<span class="' + e + "-close-icon " + n.namespace + '-close">',
                                    n.closeIcon,
                                    "</span>",
                                    '<div class="' + n.namespace + '-inner">' + n.loading + "</div>",
                                    "</div>",
                                    "</div>",
                                ].join("")
                        )),
                        "." + n.namespace + "-close" + (n.otherClose ? "," + n.otherClose : ""));
                return (
                    (n.$instance = e.clone().addClass(n.variant)),
                    n.$instance.on(n.closeTrigger + "." + n.namespace, function (e) {
                        var a = t(e.target);
                        (("background" === n.closeOnClick && a.is("." + n.namespace)) || "anywhere" === n.closeOnClick || a.closest(i).length) && (n.close(e), e.preventDefault());
                    }),
                    this
                );
            },
            getContent: function () {
                if (!1 !== this.persist && this.$content) return this.$content;
                function e(t) {
                    return a.$currentTarget && a.$currentTarget.attr(t);
                }
                var a = this,
                    n = this.constructor.contentFilters,
                    i = e(a.targetAttr),
                    r = a.target || i || "",
                    o = n[a.type];
                if ((!o && r in n && ((o = n[r]), (r = a.target && i)), (r = r || e("href") || ""), !o)) for (var s in n) a[s] && ((o = n[s]), (r = a[s]));
                if (!o) {
                    var l = r;
                    if (
                        ((r = null),
                        t.each(a.contentFilters, function () {
                            return !(r = !(r = (o = n[this]).test ? o.test(l) : r) && o.regex && l.match && l.match(o.regex) ? l : r);
                        }),
                        !r)
                    )
                        return "console" in window && window.console.error("Featherlight: no content filter found " + (l ? ' for "' + l + '"' : " (no target specified)")), !1;
                }
                return o.process.call(a, r);
            },
            setContent: function (e) {
                var a = this;
                return (
                    (e.is("iframe") || 0 < t("iframe", e).length) && a.$instance.addClass(a.namespace + "-iframe"),
                    a.$instance.removeClass(a.namespace + "-loading"),
                    a.$instance
                        .find("." + a.namespace + "-inner")
                        .not(e)
                        .slice(1)
                        .remove()
                        .end()
                        .replaceWith(t.contains(a.$instance[0], e[0]) ? "" : e),
                    (a.$content = e.addClass(a.namespace + "-inner")),
                    a
                );
            },
            open: function (e) {
                var a = this;
                if ((a.$instance.hide().appendTo(a.root), !((e && e.isDefaultPrevented()) || !1 === a.beforeOpen(e)))) {
                    e && e.preventDefault();
                    var n = a.getContent();
                    if (n)
                        return (
                            r.push(a),
                            i(!0),
                            a.$instance.fadeIn(a.openSpeed),
                            a.beforeContent(e),
                            t
                                .when(n)
                                .always(function (t) {
                                    a.setContent(t), a.afterContent(e);
                                })
                                .then(a.$instance.promise())
                                .done(function () {
                                    a.afterOpen(e);
                                })
                        );
                }
                return a.$instance.detach(), t.Deferred().reject().promise();
            },
            close: function (e) {
                var n = this,
                    r = t.Deferred();
                return (
                    !1 === n.beforeClose(e)
                        ? r.reject()
                        : (0 === a(n).length && i(!1),
                          n.$instance.fadeOut(n.closeSpeed, function () {
                              n.$instance.detach(), n.afterClose(e), r.resolve();
                          })),
                    r.promise()
                );
            },
            resize: function (t, e) {
                var a;
                t &&
                    e &&
                    (this.$content.css("width", "").css("height", ""),
                    1 < (a = Math.max(t / parseInt(this.$content.parent().css("width"), 10), e / parseInt(this.$content.parent().css("height"), 10))) && this.$content.css("width", t / a + "px").css("height", e / a + "px"));
            },
            chainCallbacks: function (e) {
                for (var a in e) this[a] = t.proxy(e[a], this, t.proxy(this[a], this));
            },
        }),
            t.extend(e, {
                id: 0,
                autoBind: "[data-featherlight]",
                defaults: e.prototype,
                contentFilters: {
                    jquery: {
                        regex: /^[#.]\w/,
                        test: function (e) {
                            return e instanceof t && e;
                        },
                        process: function (e) {
                            return !1 !== this.persist ? t(e) : t(e).clone(!0);
                        },
                    },
                    image: {
                        regex: /\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,
                        process: function (e) {
                            var a = t.Deferred(),
                                n = new Image(),
                                i = t('<img src="' + e + '" alt="" class="' + this.namespace + '-image" />');
                            return (
                                (n.onload = function () {
                                    (i.naturalWidth = n.width), (i.naturalHeight = n.height), a.resolve(i);
                                }),
                                (n.onerror = function () {
                                    a.reject(i);
                                }),
                                (n.src = e),
                                a.promise()
                            );
                        },
                    },
                    html: {
                        regex: /^\s*<[\w!][^<]*>/,
                        process: function (e) {
                            return t(e);
                        },
                    },
                    ajax: {
                        regex: /./,
                        process: function (e) {
                            var a = t.Deferred(),
                                n = t("<div></div>").load(e, function (t, e) {
                                    "error" !== e && a.resolve(n.contents()), a.fail();
                                });
                            return a.promise();
                        },
                    },
                    iframe: {
                        process: function (e) {
                            var a = new t.Deferred(),
                                n = t("<iframe/>")
                                    .hide()
                                    .attr("src", e)
                                    .css(
                                        (function (t, e) {
                                            var a,
                                                n = {},
                                                i = RegExp("^iframe([A-Z])(.*)");
                                            for (a in t) {
                                                var r = a.match(i);
                                                r && (n[(r[1] + r[2].replace(/([A-Z])/g, "-$1")).toLowerCase()] = t[a]);
                                            }
                                            return n;
                                        })(this)
                                    )
                                    .on("load", function () {
                                        a.resolve(n.show());
                                    })
                                    .appendTo(this.$instance.find("." + this.namespace + "-content"));
                            return a.promise();
                        },
                    },
                    text: {
                        process: function (e) {
                            return t("<div>", { text: e });
                        },
                    },
                },
                functionAttributes: ["beforeOpen", "afterOpen", "beforeContent", "afterContent", "beforeClose", "afterClose"],
                readElementConfig: function (e, a) {
                    var n = this,
                        i = RegExp("^data-" + a + "-(.*)"),
                        r = {};
                    return (
                        e &&
                            e.attributes &&
                            t.each(e.attributes, function () {
                                if ((a = this.name.match(i))) {
                                    var e = this.value,
                                        a = t.camelCase(a[1]);
                                    if (0 <= t.inArray(a, n.functionAttributes)) e = Function(e);
                                    else
                                        try {
                                            e = t.parseJSON(e);
                                        } catch (o) {}
                                    r[a] = e;
                                }
                            }),
                        r
                    );
                },
                extend: function (e, a) {
                    function n() {
                        this.constructor = e;
                    }
                    return (n.prototype = this.prototype), (e.prototype = new n()), (e.__super__ = this.prototype), t.extend(e, this, a), (e.defaults = e.prototype), e;
                },
                attach: function (e, a, n) {
                    var i = this;
                    "object" != typeof a || a instanceof t != 0 || n || ((n = a), (a = void 0));
                    var r,
                        o = (n = t.extend({}, n)).namespace || i.defaults.namespace,
                        s = t.extend({}, i.defaults, i.readElementConfig(e[0], o), n);
                    return (
                        e.on(s.openTrigger + "." + s.namespace, s.filter, function (o) {
                            var l = t.extend({ $source: e, $currentTarget: t(this) }, i.readElementConfig(e[0], s.namespace), i.readElementConfig(this, s.namespace), n),
                                c = r || t(this).data("featherlight-persisted") || new i(a, l);
                            "shared" === c.persist ? (r = c) : !1 !== c.persist && t(this).data("featherlight-persisted", c), l.$currentTarget.blur(), c.open(o);
                        }),
                        e
                    );
                },
                current: function () {
                    var t = this.opened();
                    return t[t.length - 1] || null;
                },
                opened: function () {
                    var e = this;
                    return (
                        a(),
                        t.grep(r, function (t) {
                            return t instanceof e;
                        })
                    );
                },
                close: function (t) {
                    var e = this.current();
                    return e ? e.close(t) : void 0;
                },
                _onReady: function () {
                    var e = this;
                    e.autoBind &&
                        (t(e.autoBind).each(function () {
                            e.attach(t(this));
                        }),
                        t(document).on("click", e.autoBind, function (a) {
                            a.isDefaultPrevented() || "featherlight" === a.namespace || (a.preventDefault(), e.attach(t(a.currentTarget)), t(a.target).trigger("click.featherlight"));
                        }));
                },
                _callbackChain: {
                    onKeyUp: function (e, a) {
                        return 27 === a.keyCode ? (this.closeOnEsc && t.featherlight.close(a), !1) : e(a);
                    },
                    onResize: function (t, e) {
                        return this.resize(this.$content.naturalWidth, this.$content.naturalHeight), t(e);
                    },
                    afterContent: function (t, e) {
                        return (t = t(e)), this.onResize(e), t;
                    },
                },
            }),
            (t.featherlight = e),
            (t.fn.featherlight = function (t, a) {
                return e.attach(this, t, a);
            }),
            t(document).ready(function () {
                e._onReady();
            });
    })(jQuery),
    (function (t, e) {
        function a() {
            var t = this;
            (t.id = null),
                (t.busy = !1),
                (t.start = function (e, a) {
                    t.busy ||
                        (t.stop(),
                        (t.id = setTimeout(function () {
                            e(), (t.id = null), (t.busy = !1);
                        }, a)),
                        (t.busy = !0));
                }),
                (t.stop = function () {
                    null !== t.id && (clearTimeout(t.id), (t.id = null), (t.busy = !1));
                });
        }
        function n(n, i, r) {
            var o = this;
            (o.id = r), (o.table = n), (o.options = i), (o.breakpoints = []), (o.breakpointNames = ""), (o.columns = {}), (o.plugins = e.footable.plugins.load(o));
            var s = o.options,
                l = s.classes,
                c = s.events,
                h = s.triggers,
                d = 0;
            return (
                (o.timers = {
                    resize: new a(),
                    register: function (t) {
                        return (o.timers[t] = new a()), o.timers[t];
                    },
                }),
                (o.init = function () {
                    var a = t(e),
                        n = t(o.table);
                    if ((e.footable.plugins.init(o), n.hasClass(l.loaded))) o.raise(c.alreadyInitialized);
                    else {
                        for (var i in (o.raise(c.initializing),
                        n.addClass(l.loading),
                        n.find(s.columnDataSelector).each(function () {
                            var t = o.getColumnData(this);
                            o.columns[t.index] = t;
                        }),
                        s.breakpoints))
                            o.breakpoints.push({ name: i, width: s.breakpoints[i] }), (o.breakpointNames += i + " ");
                        o.breakpoints.sort(function (t, e) {
                            return t.width - e.width;
                        }),
                            n
                                .unbind(h.initialize)
                                .on(h.initialize, function () {
                                    n.removeData("footable_info"), n.data("breakpoint", ""), n.trigger(h.resize), n.removeClass(l.loading), n.addClass(l.loaded).addClass(l.main), o.raise(c.initialized);
                                })
                                .unbind(h.redraw)
                                .on(h.redraw, function () {
                                    o.redraw();
                                })
                                .unbind(h.resize)
                                .on(h.resize, function () {
                                    o.resize();
                                })
                                .unbind(h.expandFirstRow)
                                .on(h.expandFirstRow, function () {
                                    n.find(s.toggleSelector)
                                        .first()
                                        .not("." + l.detailShow)
                                        .trigger(h.toggleRow);
                                })
                                .unbind(h.expandAll)
                                .on(h.expandAll, function () {
                                    n.find(s.toggleSelector)
                                        .not("." + l.detailShow)
                                        .trigger(h.toggleRow);
                                })
                                .unbind(h.collapseAll)
                                .on(h.collapseAll, function () {
                                    n.find("." + l.detailShow).trigger(h.toggleRow);
                                }),
                            n.trigger(h.initialize),
                            a.on("resize.footable", function () {
                                o.timers.resize.stop(),
                                    o.timers.resize.start(function () {
                                        o.raise(h.resize);
                                    }, s.delay);
                            });
                    }
                }),
                (o.addRowToggle = function () {
                    if (s.addRowToggle) {
                        var e,
                            a = t(o.table),
                            n = !1;
                        for (e in (a.find("span." + l.toggle).remove(), o.columns)) {
                            var i = o.columns[e];
                            if (i.toggle)
                                return (
                                    (n = !0),
                                    (i =
                                        "> tbody > tr:not(." +
                                        l.detail +
                                        ",." +
                                        l.disabled +
                                        ") > td:nth-child(" +
                                        (parseInt(i.index, 10) + 1) +
                                        "),> tbody > tr:not(." +
                                        l.detail +
                                        ",." +
                                        l.disabled +
                                        ") > th:nth-child(" +
                                        (parseInt(i.index, 10) + 1) +
                                        ")"),
                                    void a
                                        .find(i)
                                        .not("." + l.detailCell)
                                        .prepend(t(s.toggleHTMLElement).addClass(l.toggle))
                                );
                        }
                        n ||
                            a
                                .find("> tbody > tr:not(." + l.detail + ",." + l.disabled + ") > td:first-child")
                                .add("> tbody > tr:not(." + l.detail + ",." + l.disabled + ") > th:first-child")
                                .not("." + l.detailCell)
                                .prepend(t(s.toggleHTMLElement).addClass(l.toggle));
                    }
                }),
                (o.setColumnClasses = function () {
                    var e,
                        a = t(o.table);
                    for (e in o.columns) {
                        var n,
                            i,
                            r = o.columns[e];
                        null !== r.className &&
                            ((i = ((n = ""), !0)),
                            t.each(r.matches, function (t, e) {
                                i || (n += ", "), (n += "> tbody > tr:not(." + l.detail + ") > td:nth-child(" + (parseInt(e, 10) + 1) + ")"), (i = !1);
                            }),
                            a
                                .find(n)
                                .not("." + l.detailCell)
                                .addClass(r.className));
                    }
                }),
                (o.bindToggleSelectors = function () {
                    var e = t(o.table);
                    o.hasAnyBreakpointColumn() &&
                        (e
                            .find(s.toggleSelector)
                            .unbind(h.toggleRow)
                            .on(h.toggleRow, function () {
                                var e = t(this).is("tr") ? t(this) : t(this).parents("tr:first");
                                o.toggleDetail(e);
                            }),
                        e
                            .find(s.toggleSelector)
                            .unbind("click.footable")
                            .on("click.footable", function (a) {
                                e.is(".breakpoint") && t(a.target).is("td,th,." + l.toggle) && t(this).trigger(h.toggleRow);
                            }));
                }),
                (o.parse = function (t, e) {
                    return (s.parsers[e.type] || s.parsers.alpha)(t);
                }),
                (o.getColumnData = function (e) {
                    var a = t(e),
                        n = a.data("hide"),
                        i = a.index();
                    (n = n || ""),
                        (n = jQuery.map(n.split(","), function (t) {
                            return jQuery.trim(t);
                        }));
                    var r = {
                        index: i,
                        hide: {},
                        type: a.data("type") || "alpha",
                        name: a.data("name") || t.trim(a.text()),
                        ignore: a.data("ignore") || !1,
                        toggle: a.data("toggle") || !1,
                        className: a.data("class") || null,
                        matches: [],
                        names: {},
                        group: a.data("group") || null,
                        groupName: null,
                        isEditable: a.data("editable"),
                    };
                    null !== r.group &&
                        ((l = t(o.table)
                            .find('> thead > tr.footable-group-row > th[data-group="' + r.group + '"], > thead > tr.footable-group-row > td[data-group="' + r.group + '"]')
                            .first()),
                        (r.groupName = o.parse(l, { type: "alpha" })));
                    var l = parseInt(a.prev().attr("colspan") || 0, 10);
                    d += 1 < l ? l - 1 : 0;
                    var h = parseInt(a.attr("colspan") || 0, 10),
                        u = r.index + d;
                    if (1 < h) {
                        var f = a.data("names");
                        f = (f = f || "").split(",");
                        for (var p = 0; p < h; p++) r.matches.push(p + u), f.length > p && (r.names[p + u] = f[p]);
                    } else r.matches.push(u);
                    r.hide.default = "all" === a.data("hide") || 0 <= t.inArray("default", n);
                    var g,
                        m = !1;
                    for (g in s.breakpoints) (r.hide[g] = "all" === a.data("hide") || 0 <= t.inArray(g, n)), (m = m || r.hide[g]);
                    return (r.hasBreakpoint = m), o.raise(c.columnData, { column: { data: r, th: e } }).column.data;
                }),
                (o.getViewportWidth = function () {
                    return window.innerWidth || (document.body ? document.body.offsetWidth : 0);
                }),
                (o.calculateWidth = function (t, e) {
                    return "function" == typeof s.calculateWidthOverride ? s.calculateWidthOverride(t, e) : (e.viewportWidth < e.width && (e.width = e.viewportWidth), e.parentWidth < e.width && (e.width = e.parentWidth), e);
                }),
                (o.hasBreakpointColumn = function (t) {
                    for (var e in o.columns)
                        if (o.columns[e].hide[t]) {
                            if (o.columns[e].ignore) continue;
                            return !0;
                        }
                    return !1;
                }),
                (o.hasAnyBreakpointColumn = function () {
                    for (var t in o.columns) if (o.columns[t].hasBreakpoint) return !0;
                    return !1;
                }),
                (o.resize = function () {
                    var e = t(o.table);
                    if (e.is(":visible")) {
                        if (o.hasAnyBreakpointColumn()) {
                            var a = { width: e.width(), viewportWidth: o.getViewportWidth(), parentWidth: e.parent().width() },
                                n = ((a = o.calculateWidth(e, a)), e.data("footable_info"));
                            if ((e.data("footable_info", a), o.raise(c.resizing, { old: n, info: a }), !n || (n && n.width && n.width !== a.width))) {
                                for (var i, r = null, s = 0; o.breakpoints.length > s; s++)
                                    if ((i = o.breakpoints[s]) && i.width && a.width <= i.width) {
                                        r = i;
                                        break;
                                    }
                                var l = null === r ? "default" : r.name,
                                    d = o.hasBreakpointColumn(l),
                                    u = e.data("breakpoint");
                                e
                                    .data("breakpoint", l)
                                    .removeClass("default breakpoint")
                                    .removeClass(o.breakpointNames)
                                    .addClass(l + (d ? " breakpoint" : "")),
                                    l !== u && (e.trigger(h.redraw), o.raise(c.breakpoint, { breakpoint: l, info: a }));
                            }
                            o.raise(c.resized, { old: n, info: a });
                        } else e.trigger(h.redraw);
                    }
                }),
                (o.redraw = function () {
                    o.addRowToggle(), o.bindToggleSelectors(), o.setColumnClasses();
                    var e = t(o.table),
                        a = e.data("breakpoint"),
                        n = o.hasBreakpointColumn(a);
                    e
                        .find("> tbody > tr:not(." + l.detail + ")")
                        .data("detail_created", !1)
                        .end()
                        .find("> thead > tr:last-child > th")
                        .each(function () {
                            var n = o.columns[t(this).index()],
                                i = "",
                                r = !0;
                            t.each(n.matches, function (t, e) {
                                r || (i += ", "),
                                    (e += 1),
                                    (i += "> tbody > tr:not(." + l.detail + ") > td:nth-child(" + e + ")"),
                                    (i += ", > tfoot > tr:not(." + l.detail + ") > td:nth-child(" + e + ")"),
                                    (i += ", > colgroup > col:nth-child(" + e + ")"),
                                    (r = !1);
                            }),
                                (i += ', > thead > tr[data-group-row="true"] > th[data-group="' + n.group + '"]');
                            var s,
                                c = e.find(i).add(this);
                            "" !== a && (!1 === n.hide[a] ? c.addClass("footable-visible").show() : c.removeClass("footable-visible").hide()),
                                1 === e.find("> thead > tr.footable-group-row").length &&
                                    ((c = e.find('> thead > tr:last-child > th[data-group="' + n.group + '"]:visible, > thead > tr:last-child > th[data-group="' + n.group + '"]:visible')),
                                    (n = e.find('> thead > tr.footable-group-row > th[data-group="' + n.group + '"], > thead > tr.footable-group-row > td[data-group="' + n.group + '"]')),
                                    (s = 0),
                                    t.each(c, function () {
                                        s += parseInt(t(this).attr("colspan") || 1, 10);
                                    }),
                                    0 < s ? n.attr("colspan", s).show() : n.hide());
                        })
                        .end()
                        .find("> tbody > tr." + l.detailShow)
                        .each(function () {
                            o.createOrUpdateDetailRow(this);
                        }),
                        e.find("[data-bind-name]").each(function () {
                            o.toggleInput(this);
                        }),
                        e.find("> tbody > tr." + l.detailShow + ":visible").each(function () {
                            var e = t(this).next();
                            e.hasClass(l.detail) && (n ? e.show() : e.hide());
                        }),
                        e.find("> thead > tr > th.footable-last-column, > tbody > tr > td.footable-last-column").removeClass("footable-last-column"),
                        e.find("> thead > tr > th.footable-first-column, > tbody > tr > td.footable-first-column").removeClass("footable-first-column"),
                        e
                            .find("> thead > tr, > tbody > tr")
                            .find("> th.footable-visible:last, > td.footable-visible:last")
                            .addClass("footable-last-column")
                            .end()
                            .find("> th.footable-visible:first, > td.footable-visible:first")
                            .addClass("footable-first-column"),
                        o.raise(c.redrawn);
                }),
                (o.toggleDetail = function (e) {
                    var a = e.jquery ? e : t(e);
                    (e = a.next()),
                        a.hasClass(l.detailShow)
                            ? (a.removeClass(l.detailShow), e.hasClass(l.detail) && e.hide(), o.raise(c.rowCollapsed, { row: a[0] }))
                            : (o.createOrUpdateDetailRow(a[0]), a.addClass(l.detailShow).next().show(), o.raise(c.rowExpanded, { row: a[0] }));
                }),
                (o.removeRow = function (e) {
                    var a = e.jquery ? e : t(e);
                    (e = (a = a.hasClass(l.detail) ? a.prev() : a).next()), !0 === a.data("detail_created") && e.remove(), a.remove(), o.raise(c.rowRemoved);
                }),
                (o.appendRow = function (e) {
                    (e = e.jquery ? e : t(e)), t(o.table).find("tbody").append(e), o.redraw();
                }),
                (o.getColumnFromTdIndex = function (e) {
                    var a,
                        n = null;
                    for (a in o.columns)
                        if (0 <= t.inArray(e, o.columns[a].matches)) {
                            n = o.columns[a];
                            break;
                        }
                    return n;
                }),
                (o.createOrUpdateDetailRow = function (e) {
                    var a = t(e),
                        n = a.next(),
                        i = [];
                    if (!0 === a.data("detail_created")) return !0;
                    if (
                        a.is(":hidden") ||
                        (o.raise(c.rowDetailUpdating, { row: a, detail: n }),
                        a.find("> td:hidden").each(function () {
                            var e = t(this).index(),
                                a = o.getColumnFromTdIndex(e),
                                n = a.name;
                            if (!0 === a.ignore) return !0;
                            e in a.names && (n = a.names[e]);
                            var r,
                                s,
                                c = t(this).attr("data-bind-name");
                            return (
                                null != c && t(this).is(":empty") && ((r = t("." + l.detailInnerValue + '[data-bind-value="' + c + '"]')), t(this).html(t(r).contents().detach())),
                                !1 !== a.isEditable && (a.isEditable || 0 < t(this).find(":input").length) && (null == c && ((c = "bind-" + t.now() + "-" + e), t(this).attr("data-bind-name", c)), (s = t(this).contents().detach())),
                                (s = s || t(this).contents().clone(!0, !0)),
                                i.push({ name: n, value: o.parse(this, a), display: s, group: a.group, groupName: a.groupName, bindName: c }),
                                !0
                            );
                        }),
                        0 === i.length)
                    )
                        return !1;
                    var r = a.find("> td:visible").length;
                    return (
                        (e = n.hasClass(l.detail)) || ((n = t('<tr class="' + escapeHtml(l.detail) + '"><td class="' + escapeHtml(l.detailCell) + '"><div class="' + escapeHtml(l.detailInner )+ '"></div></td></tr>')), a.after(n)),
                        n.find("> td:first").attr("colspan", r),
                        (r = n.find("." + l.detailInner).empty()),
                        s.createDetail(r, i, s.createGroupedDetail, s.detailSeparator, l),
                        a.data("detail_created", !0),
                        o.raise(c.rowDetailUpdated, { row: a, detail: n }),
                        !e
                    );
                }),
                (o.raise = function (e, a) {
                    !0 === o.options.debug && "function" == typeof o.options.log && o.options.log(e, "event");
                    var n = { ft: o };
                    return t.extend(!0, n, (a = a || {})), (e = t.Event(e, n)).ft || t.extend(!0, e, n), t(o.table).trigger(e), e;
                }),
                (o.reset = function () {
                    var e = t(o.table);
                    e.removeData("footable_info").data("breakpoint", "").removeClass(l.loading).removeClass(l.loaded),
                        e.find(s.toggleSelector).unbind(h.toggleRow).unbind("click.footable"),
                        e.find("> tbody > tr").removeClass(l.detailShow),
                        e.find("> tbody > tr." + l.detail).remove(),
                        o.raise(c.reset);
                }),
                (o.toggleInput = function (e) {
                    var a = t(e).attr("data-bind-name");
                    null == a ||
                        (null != (a = t("." + l.detailInnerValue + '[data-bind-value="' + a + '"]')) &&
                            (t(e).is(":visible") ? t(a).is(":empty") || t(e).html(t(a).contents().detach()) : t(e).is(":empty") || t(a).html(t(e).contents().detach())));
                }),
                o.init(),
                o
            );
        }
        e.footable = {
            options: {
                delay: 100,
                breakpoints: { phone: 480, tablet: 1024 },
                parsers: {
                    alpha: function (e) {
                        return t(e).data("value") || t.trim(t(e).text());
                    },
                    numeric: function (e) {
                        return isNaN(
                            (e = parseFloat(
                                (e =
                                    t(e).data("value") ||
                                    t(e)
                                        .text()
                                        .replace(/[^0-9.\-]/g, ""))
                            ))
                        )
                            ? 0
                            : e;
                    },
                },
                addRowToggle: !0,
                calculateWidthOverride: null,
                toggleSelector: " > tbody > tr:not(.footable-row-detail)",
                columnDataSelector: "> thead > tr:last-child > th, > thead > tr:last-child > td",
                detailSeparator: ":",
                toggleHTMLElement: "<span />",
                createGroupedDetail: function (t) {
                    for (var e = { _none: { name: null, data: [] } }, a = 0; t.length > a; a++) {
                        var n = t[a].group;
                        null !== n ? (n in e || (e[n] = { name: t[a].groupName || t[a].group, data: [] }), e[n].data.push(t[a])) : e._none.data.push(t[a]);
                    }
                    return e;
                },
                createDetail: function (e, a, n, i, r) {
                    var o,
                        s = n(a);
                    for (o in s)
                        if (0 !== s[o].data.length) {
                            "_none" !== o && e.append('<div class="' + r.detailInnerGroup + '">' + s[o].name + "</div>");
                            for (var l = 0; s[o].data.length > l; l++) {
                                var c = s[o].data[l].name ? i : "";
                                e.append(
                                    t("<div></div>")
                                        .addClass(r.detailInnerRow)
                                        .append(
                                            t("<div></div>")
                                                .addClass(r.detailInnerName)
                                                .append(s[o].data[l].name + c)
                                        )
                                        .append(t("<div></div>").addClass(r.detailInnerValue).attr("data-bind-value", s[o].data[l].bindName).append(s[o].data[l].display))
                                );
                            }
                        }
                },
                classes: {
                    main: "footable",
                    loading: "footable-loading",
                    loaded: "footable-loaded",
                    toggle: "footable-toggle",
                    disabled: "footable-disabled",
                    detail: "footable-row-detail",
                    detailCell: "footable-row-detail-cell",
                    detailInner: "footable-row-detail-inner",
                    detailInnerRow: "footable-row-detail-row",
                    detailInnerGroup: "footable-row-detail-group",
                    detailInnerName: "footable-row-detail-name",
                    detailInnerValue: "footable-row-detail-value",
                    detailShow: "footable-detail-show",
                },
                triggers: {
                    initialize: "footable_initialize",
                    resize: "footable_resize",
                    redraw: "footable_redraw",
                    toggleRow: "footable_toggle_row",
                    expandFirstRow: "footable_expand_first_row",
                    expandAll: "footable_expand_all",
                    collapseAll: "footable_collapse_all",
                },
                events: {
                    alreadyInitialized: "footable_already_initialized",
                    initializing: "footable_initializing",
                    initialized: "footable_initialized",
                    resizing: "footable_resizing",
                    resized: "footable_resized",
                    redrawn: "footable_redrawn",
                    breakpoint: "footable_breakpoint",
                    columnData: "footable_column_data",
                    rowDetailUpdating: "footable_row_detail_updating",
                    rowDetailUpdated: "footable_row_detail_updated",
                    rowCollapsed: "footable_row_collapsed",
                    rowExpanded: "footable_row_expanded",
                    rowRemoved: "footable_row_removed",
                    reset: "footable_reset",
                },
                debug: !1,
                log: null,
            },
            version: {
                major: 0,
                minor: 5,
                toString: function () {
                    return e.footable.version.major + "." + e.footable.version.minor;
                },
                parse: function (t) {
                    return { major: parseInt((t = /(\d+)\.?(\d+)?\.?(\d+)?/.exec(t))[1], 10) || 0, minor: parseInt(t[2], 10) || 0, patch: parseInt(t[3], 10) || 0 };
                },
            },
            plugins: {
                _validate: function (t) {
                    return "string" != typeof (t = new t()).name
                        ? (!0 === e.footable.options.debug && console.error('Validation failed, plugin does not implement a string property called "name".', t), !1)
                        : "function" == typeof t.init
                        ? (!0 === e.footable.options.debug && console.log('Validation succeeded for plugin "' + t.name + '".', t), !0)
                        : (!0 === e.footable.options.debug && console.error('Validation failed, plugin "' + t.name + '" does not implement a function called "init".', t), !1);
                },
                registered: [],
                register: function (a, n) {
                    e.footable.plugins._validate(a) && (e.footable.plugins.registered.push(a), "object" == typeof n && t.extend(!0, e.footable.options, n));
                },
                load: function (t) {
                    for (var a, n = [], i = 0; e.footable.plugins.registered.length > i; i++)
                        try {
                            (a = e.footable.plugins.registered[i]), n.push(new a(t));
                        } catch (r) {
                            !0 === e.footable.options.debug && console.error(r);
                        }
                    return n;
                },
                init: function (t) {
                    for (var a = 0; t.plugins.length > a; a++)
                        try {
                            t.plugins[a].init(t);
                        } catch (n) {
                            !0 === e.footable.options.debug && console.error(n);
                        }
                },
            },
        };
        var i = 0;
        t.fn.footable = function (a) {
            var r = t.extend(!0, {}, e.footable.options, (a = a || {}));
            return this.each(function () {
                var e = new n(this, r, ++i);
                t(this).data("footable", e);
            });
        };
    })(jQuery, window),
    (function (t, e) {
        if (void 0 === e.footable || null === e.footable) throw Error("Please check and make sure footable.js is included in the page and is loaded prior to this script.");
        e.footable.plugins.register(
            function () {
                var e = this;
                (e.name = "Footable Filter"),
                    (e.init = function (a) {
                        !0 !== (e.footable = a).options.filter.enabled ||
                            (!1 !== t(a.table).data("filter") &&
                                (a.timers.register("filter"),
                                t(a.table)
                                    .unbind(".filtering")
                                    .on({
                                        "footable_initialized.filtering": function () {
                                            var n = t(a.table),
                                                i = {
                                                    input: n.data("filter") || a.options.filter.input,
                                                    timeout: n.data("filter-timeout") || a.options.filter.timeout,
                                                    minimum: n.data("filter-minimum") || a.options.filter.minimum,
                                                    disableEnter: n.data("filter-disable-enter") || a.options.filter.disableEnter,
                                                };
                                            i.disableEnter &&
                                                t(i.input).keypress(function (t) {
                                                    return window.event ? 13 !== window.event.keyCode : 13 !== t.which;
                                                }),
                                                n.on("footable_clear_filter", function () {
                                                    t(i.input).val(""), e.clearFilter();
                                                }),
                                                n.on("footable_filter", function (t, a) {
                                                    e.filter(a.filter);
                                                }),
                                                t(i.input).keyup(function (n) {
                                                    a.timers.filter.stop(),
                                                        27 === n.which && t(i.input).val(""),
                                                        a.timers.filter.start(function () {
                                                            var a = t(i.input).val() || "";
                                                            e.filter(a);
                                                        }, i.timeout);
                                                });
                                        },
                                        "footable_redrawn.filtering": function () {
                                            var n = t(a.table).data("filter-string");
                                            n && e.filter(n);
                                        },
                                    })
                                    .data("footable-filter", e)));
                    }),
                    (e.filter = function (a) {
                        var n,
                            i = e.footable,
                            r = t(i.table),
                            o = r.data("filter-minimum") || i.options.filter.minimum;
                        ((a = i.raise("footable_filtering", { filter: a, clear: !a })) && !1 === a.result) ||
                            (a.filter && o > a.filter.length) ||
                            (a.clear
                                ? e.clearFilter()
                                : ((o = a.filter.split(" ")),
                                  r.find("> tbody > tr").hide().addClass("footable-filtered"),
                                  (n = r.find("> tbody > tr:not(.footable-row-detail)")),
                                  t.each(o, function (t, e) {
                                      e && 0 < e.length && (r.data("current-filter", e), (n = n.filter(i.options.filter.filterFunction)));
                                  }),
                                  n.each(function () {
                                      e.showRow(this, i), t(this).removeClass("footable-filtered");
                                  }),
                                  r.data("filter-string", a.filter),
                                  i.raise("footable_filtered", { filter: a.filter, clear: !1 })));
                    }),
                    (e.clearFilter = function () {
                        var a = e.footable,
                            n = t(a.table);
                        n
                            .find("> tbody > tr:not(.footable-row-detail)")
                            .removeClass("footable-filtered")
                            .each(function () {
                                e.showRow(this, a);
                            }),
                            n.removeData("filter-string"),
                            a.raise("footable_filtered", { clear: !0 });
                    }),
                    (e.showRow = function (e, a) {
                        var n = t(e),
                            i = n.next(),
                            r = t(a.table);
                        n.is(":visible") || (r.hasClass("breakpoint") && n.hasClass("footable-detail-show") && i.hasClass("footable-row-detail") ? (n.add(i).show(), a.createOrUpdateDetailRow(e)) : n.show());
                    });
            },
            {
                filter: {
                    enabled: !0,
                    input: ".footable-filter",
                    timeout: 300,
                    minimum: 2,
                    disableEnter: !1,
                    filterFunction: function () {
                        var e = t(this),
                            a = e.parents("table:first"),
                            n = a.data("current-filter").toUpperCase(),
                            i = e.find("td").text();
                        return (
                            a.data("filter-text-only") ||
                                e.find("td[data-value]").each(function () {
                                    i += t(this).data("value");
                                }),
                            0 <= i.toUpperCase().indexOf(n)
                        );
                    },
                },
            }
        );
    })(jQuery, window),
    (function (t, e) {
        function a(e) {
            var a = t(e.table).data();
            (this.pageNavigation = a.pageNavigation || e.options.pageNavigation),
                (this.pageSize = a.pageSize || e.options.pageSize),
                (this.firstText = a.firstText || e.options.firstText),
                (this.previousText = a.previousText || e.options.previousText),
                (this.nextText = a.nextText || e.options.nextText),
                (this.lastText = a.lastText || e.options.lastText),
                (this.limitNavigation = parseInt(a.limitNavigation || e.options.limitNavigation || n.limitNavigation, 10)),
                (this.limitPreviousText = a.limitPreviousText || e.options.limitPreviousText),
                (this.limitNextText = a.limitNextText || e.options.limitNextText),
                (this.limit = 0 < this.limitNavigation),
                (this.currentPage = a.currentPage || 0),
                (this.pages = []),
                (this.control = !1);
        }
        if (void 0 === e.footable || null === e.footable) throw Error("Please check and make sure footable.js is included in the page and is loaded prior to this script.");
        var n = { paginate: !0, pageSize: 10, pageNavigation: ".pagination", firstText: "&laquo;", previousText: "&lsaquo;", nextText: "&rsaquo;", lastText: "&raquo;", limitNavigation: 0, limitPreviousText: "...", limitNextText: "..." };
        e.footable.plugins.register(function () {
            var e = this;
            (e.name = "Footable Paginate"),
                (e.init = function (a) {
                    !0 === a.options.paginate &&
                        !1 !== t(a.table).data("page") &&
                        ((e.footable = a),
                        t(a.table)
                            .unbind(".paging")
                            .on({
                                "footable_initialized.paging footable_row_removed.paging footable_redrawn.paging footable_sorted.paging footable_filtered.paging": function () {
                                    e.setupPaging();
                                },
                            })
                            .data("footable-paging", e));
                }),
                (e.setupPaging = function () {
                    var n = e.footable,
                        i = t(n.table).find("> tbody");
                    (n.pageInfo = new a(n)), e.createPages(n, i), e.createNavigation(n, i), e.fillPage(n, i, n.pageInfo.currentPage);
                }),
                (e.createPages = function (e, a) {
                    var n = 1,
                        i = e.pageInfo,
                        r = n * i.pageSize,
                        o = [],
                        s = [];
                    i.pages = [];
                    var l = a.find("> tr:not(.footable-filtered,.footable-row-detail)");
                    l.each(function (t, e) {
                        o.push(e), t === r - 1 ? (i.pages.push(o), (r = ++n * i.pageSize), (o = [])) : t >= l.length - (l.length % i.pageSize) && s.push(e);
                    }),
                        0 < s.length && i.pages.push(s),
                        i.currentPage >= i.pages.length && (i.currentPage = i.pages.length - 1),
                        i.currentPage < 0 && (i.currentPage = 0),
                        1 === i.pages.length ? t(e.table).addClass("no-paging") : t(e.table).removeClass("no-paging");
                }),
                (e.createNavigation = function (a) {
                    var n,
                        i = t(a.table).find(a.pageInfo.pageNavigation);
                    if (0 === i.length) {
                        if (0 < (i = t(a.pageInfo.pageNavigation)).parents("table:first").length && i.parents("table:first") !== t(a.table)) return;
                        1 < i.length && !0 === a.options.debug && console.error("More than one pagination control was found!");
                    }
                    0 !== i.length &&
                        (i.is("ul") || (0 === i.find("ul:first").length && i.append("<ul />"), (i = i.find("ul"))),
                        i.find("li").remove(),
                        ((n = a.pageInfo).control = i),
                        0 < n.pages.length &&
                            (i.append('<li class="footable-page-arrow"><a data-page="first" href="#first">' + a.pageInfo.firstText + "</a>"),
                            i.append('<li class="footable-page-arrow"><a data-page="prev" href="#prev">' + a.pageInfo.previousText + "</a></li>"),
                            n.limit && i.append('<li class="footable-page-arrow"><a data-page="limit-prev" href="#limit-prev">' + a.pageInfo.limitPreviousText + "</a></li>"),
                            n.limit ||
                                t.each(n.pages, function (t, e) {
                                    0 < e.length && i.append('<li class="footable-page"><a data-page="' + t + '" href="#">' + (t + 1) + "</a></li>");
                                }),
                            n.limit && (i.append('<li class="footable-page-arrow"><a data-page="limit-next" href="#limit-next">' + a.pageInfo.limitNextText + "</a></li>"), e.createLimited(i, n, 0)),
                            i.append('<li class="footable-page-arrow"><a data-page="next" href="#next">' + a.pageInfo.nextText + "</a></li>"),
                            i.append('<li class="footable-page-arrow"><a data-page="last" href="#last">' + a.pageInfo.lastText + "</a></li>")),
                        i.off("click", "a[data-page]").on("click", "a[data-page]", function (r) {
                            r.preventDefault();
                            var o,
                                s = t(this).data("page");
                            if (
                                ((r = n.currentPage),
                                "first" === s
                                    ? (r = 0)
                                    : "prev" === s
                                    ? 0 < r && r--
                                    : "next" === s
                                    ? n.pages.length - 1 > r && r++
                                    : "last" === s
                                    ? (r = n.pages.length - 1)
                                    : "limit-prev" === s
                                    ? ((r = -1), (o = i.find(".footable-page:first a").data("page")), e.createLimited(i, n, o - n.limitNavigation), e.setPagingClasses(i, n.currentPage, n.pages.length))
                                    : "limit-next" === s
                                    ? ((r = -1), (o = i.find(".footable-page:last a").data("page")), e.createLimited(i, n, o + 1), e.setPagingClasses(i, n.currentPage, n.pages.length))
                                    : (r = s),
                                0 <= r)
                            ) {
                                if (n.limit && n.currentPage != r) {
                                    for (var l = r; 0 != l % n.limitNavigation; ) --l;
                                    e.createLimited(i, n, l);
                                }
                                e.paginate(a, r);
                            }
                        }),
                        e.setPagingClasses(i, n.currentPage, n.pages.length));
                }),
                (e.createLimited = function (t, e, a) {
                    (a = a || 0), t.find("li.footable-page").remove();
                    for (var n, i = t.find('li.footable-page-arrow > a[data-page="limit-prev"]').parent(), r = ((t = t.find('li.footable-page-arrow > a[data-page="limit-next"]').parent()), e.pages.length - 1); 0 <= r; r--)
                        (n = e.pages[r]), a <= r && a + e.limitNavigation > r && 0 < n.length && i.after('<li class="footable-page"><a data-page="' + r + '" href="#">' + (r + 1) + "</a></li>");
                    0 === a ? i.hide() : i.show(), a + e.limitNavigation >= e.pages.length ? t.hide() : t.show();
                }),
                (e.paginate = function (a, n) {
                    var i,
                        r,
                        o = a.pageInfo;
                    o.currentPage !== n &&
                        ((i = t(a.table).find("> tbody")),
                        ((r = a.raise("footable_paging", { page: n, size: o.pageSize })) && !1 === r.result) ||
                            (e.fillPage(a, i, n), o.control.find("li").removeClass("active disabled"), e.setPagingClasses(o.control, o.currentPage, o.pages.length)));
                }),
                (e.setPagingClasses = function (t, e, a) {
                    t
                        .find("li.footable-page > a[data-page=" + e + "]")
                        .parent()
                        .addClass("active"),
                        a - 1 <= e && (t.find('li.footable-page-arrow > a[data-page="next"]').parent().addClass("disabled"), t.find('li.footable-page-arrow > a[data-page="last"]').parent().addClass("disabled")),
                        e < 1 && (t.find('li.footable-page-arrow > a[data-page="first"]').parent().addClass("disabled"), t.find('li.footable-page-arrow > a[data-page="prev"]').parent().addClass("disabled"));
                }),
                (e.fillPage = function (a, n, i) {
                    (a.pageInfo.currentPage = i),
                        t(a.table).data("currentPage", i),
                        n.find("> tr").hide(),
                        t(a.pageInfo.pages[i]).each(function () {
                            e.showRow(this, a);
                        }),
                        a.raise("footable_page_filled");
                }),
                (e.showRow = function (e, a) {
                    var n = t(e),
                        i = n.next();
                    t(a.table).hasClass("breakpoint") && n.hasClass("footable-detail-show") && i.hasClass("footable-row-detail") ? (n.add(i).show(), a.createOrUpdateDetailRow(e)) : n.show();
                });
        }, n);
    })(jQuery, window),
    (function (t, e, a) {
        if (e.footable === a || null === e.footable) throw Error("Please check and make sure footable.js is included in the page and is loaded prior to this script.");
        e.footable.plugins.register(
            function () {
                var e = this;
                (e.name = "Footable Sortable"),
                    (e.init = function (n) {
                        !0 === (e.footable = n).options.sort &&
                            t(n.table)
                                .unbind(".sorting")
                                .on({
                                    "footable_initialized.sorting": function () {
                                        var a,
                                            i,
                                            r = t(n.table),
                                            o = (r.find("> tbody"), n.options.classes.sort);
                                        if (!1 !== r.data("sort")) {
                                            for (var s in (r.find("> thead > tr:last-child > th, > thead > tr:last-child > td").each(function () {
                                                var e = t(this);
                                                !0 === n.columns[e.index()].sort.ignore || e.hasClass(o.sortable) || (e.addClass(o.sortable), t("<span />").addClass(o.indicator).appendTo(e));
                                            }),
                                            r
                                                .find("> thead > tr:last-child > th." + o.sortable + ", > thead > tr:last-child > td." + o.sortable)
                                                .unbind("click.footable")
                                                .on("click.footable", function (a) {
                                                    return a.preventDefault(), (a = !(i = t(this)).hasClass(o.sorted)), e.doSort(i.index(), a), !1;
                                                }),
                                            n.columns))
                                                if ((a = n.columns[s]).sort.initial) {
                                                    var l = "descending" !== a.sort.initial;
                                                    e.doSort(a.index, l);
                                                    break;
                                                }
                                        }
                                    },
                                    "footable_redrawn.sorting": function () {
                                        var i = t(n.table),
                                            r = n.options.classes.sort;
                                        0 <= i.data("sorted") &&
                                            i.find("> thead > tr:last-child > th").each(function (n) {
                                                var i = t(this);
                                                return (i.hasClass(r.sorted) || i.hasClass(r.descending)) && e.doSort(n), a;
                                            });
                                    },
                                    "footable_column_data.sorting": function (e) {
                                        var a = t(e.column.th);
                                        (e.column.data.sort = e.column.data.sort || {}),
                                            (e.column.data.sort.initial = a.data("sort-initial") || !1),
                                            (e.column.data.sort.ignore = a.data("sort-ignore") || !1),
                                            (e.column.data.sort.selector = a.data("sort-selector") || null),
                                            (a = a.data("sort-match") || 0) >= e.column.data.matches.length && (a = 0),
                                            (e.column.data.sort.match = e.column.data.matches[a]);
                                    },
                                })
                                .data("footable-sort", e);
                    }),
                    (e.doSort = function (n, i) {
                        var r = e.footable;
                        if (!1 !== t(r.table).data("sort") && l) {
                            var o = t(r.table),
                                s = o.find("> tbody"),
                                l = r.columns[n],
                                c = o.find("> thead > tr:last-child > th:eq(" + n + ")"),
                                h = r.options.classes.sort,
                                d = r.options.events.sort;
                            if (((i = i === a ? c.hasClass(h.sorted) : "toggle" === i ? !c.hasClass(h.sorted) : i), !0 === l.sort.ignore)) return !0;
                            ((n = r.raise(d.sorting, { column: l, direction: i ? "ASC" : "DESC" })) && !1 === n.result) ||
                                (o.data("sorted", l.index),
                                o
                                    .find("> thead > tr:last-child > th, > thead > tr:last-child > td")
                                    .not(c)
                                    .removeClass(h.sorted + " " + h.descending),
                                (i = i === a ? c.hasClass(h.sorted) : i) ? c.removeClass(h.descending).addClass(h.sorted) : c.removeClass(h.sorted).addClass(h.descending),
                                e.sort(r, s, l, i),
                                r.bindToggleSelectors(),
                                r.raise(d.sorted, { column: l, direction: i ? "ASC" : "DESC" }));
                        }
                    }),
                    (e.rows = function (e, n, i) {
                        var r = [];
                        return (
                            n
                                .find("> tr")
                                .each(function () {
                                    var n = t(this),
                                        o = null;
                                    return (
                                        !!n.hasClass(e.options.classes.detail) ||
                                        (n.next().hasClass(e.options.classes.detail) && (o = n.next().get(0)), (o = { row: n, detail: o }), i !== a && (o.value = e.parse(this.cells[i.sort.match], i)), r.push(o), !0)
                                    );
                                })
                                .detach(),
                            r
                        );
                    }),
                    (e.sort = function (t, a, n, i) {
                        var r = e.rows(t, a, n),
                            o = t.options.sorters[n.type] || t.options.sorters.alpha;
                        r.sort(function (t, e) {
                            return i ? o(t.value, e.value) : o(e.value, t.value);
                        });
                        for (var s = 0; r.length > s; s++) a.append(r[s].row), null !== r[s].detail && a.append(r[s].detail);
                    });
            },
            {
                sort: !0,
                sorters: {
                    alpha: function (t, e) {
                        return (t = "string" == typeof t ? t.toLowerCase() : t) === (e = "string" == typeof e ? e.toLowerCase() : e) ? 0 : t < e ? -1 : 1;
                    },
                    numeric: function (t, e) {
                        return t - e;
                    },
                },
                classes: { sort: { sortable: "footable-sortable", sorted: "footable-sorted", descending: "footable-sorted-desc", indicator: "footable-sort-indicator" } },
                events: { sort: { sorting: "footable_sorting", sorted: "footable_sorted" } },
            }
        );
    })(jQuery, window),
    (function (t) {
        "function" == typeof define && define.amd ? define(["jquery"], t) : t("object" == typeof exports ? require("jquery") : jQuery);
    })(function (t, e) {
        var a = "plugin_hideShowPassword",
            n = ["show", "innerToggle"],
            i = {
                show: "infer",
                innerToggle: !1,
                enable: (function () {
                    var t = document.body,
                        e = document.createElement("input"),
                        a = !0;
                    e = (t = t || document.createElement("body")).appendChild(e);
                    try {
                        e.setAttribute("type", "text");
                    } catch (n) {
                        a = !1;
                    }
                    return t.removeChild(e), a;
                })(),
                className: "hideShowPassword-field",
                initEvent: "hideShowPasswordInit",
                changeEvent: "passwordVisibilityChange",
                props: { autocapitalize: "off", autocomplete: "off", autocorrect: "off", spellcheck: "false" },
                toggle: {
                    element: '<button type="button">',
                    className: "hideShowPassword-toggle",
                    touchSupport: "undefined" != typeof Modernizr && Modernizr.touchevents,
                    attachToEvent: "click.hideShowPassword",
                    attachToTouchEvent: "touchstart.hideShowPassword mousedown.hideShowPassword",
                    attachToKeyEvent: "keyup",
                    attachToKeyCodes: !0,
                    styles: { position: "absolute" },
                    touchStyles: { pointerEvents: "none" },
                    position: "infer",
                    verticalAlign: "middle",
                    offset: 0,
                    attr: { role: "button", "aria-label": "Show Password", title: "Show Password", tabIndex: 0 },
                },
                wrapper: {
                    element: "<div>",
                    className: "hideShowPassword-wrapper",
                    enforceWidth: !0,
                    styles: { position: "relative" },
                    inheritStyles: ["display", "verticalAlign", "marginTop", "marginRight", "marginBottom", "marginLeft"],
                    innerElementStyles: { marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 },
                },
                states: {
                    shown: {
                        className: "hideShowPassword-shown",
                        changeEvent: "passwordShown",
                        props: { type: "text" },
                        toggle: { className: "hideShowPassword-toggle-hide", content: "Hide", attr: { "aria-pressed": "true", title: "Hide Password" } },
                    },
                    hidden: {
                        className: "hideShowPassword-hidden",
                        changeEvent: "passwordHidden",
                        props: { type: "password" },
                        toggle: { className: "hideShowPassword-toggle-show", content: "Show", attr: { "aria-pressed": "false", title: "Show Password" } },
                    },
                },
            };
        function r(e, a) {
            (this.element = t(e)), (this.wrapperElement = t()), (this.toggleElement = t()), this.init(a);
        }
        (r.prototype = {
            init: function (e) {
                this.update(e, i) &&
                    (this.element.addClass(this.options.className),
                    this.options.innerToggle &&
                        (this.wrapElement(this.options.wrapper),
                        this.initToggle(this.options.toggle),
                        "string" == typeof this.options.innerToggle &&
                            (this.toggleElement.hide(),
                            this.element.one(
                                this.options.innerToggle,
                                t.proxy(function () {
                                    this.toggleElement.show();
                                }, this)
                            ))),
                    this.element.trigger(this.options.initEvent, [this]));
            },
            update: function (t, e) {
                return (this.options = this.prepareOptions(t, e)), this.updateElement() && this.element.trigger(this.options.changeEvent, [this]).trigger(this.state().changeEvent, [this]), this.options.enable;
            },
            toggle: function (t) {
                return this.update({ show: (t = t || "toggle") });
            },
            prepareOptions: function (e, a) {
                var n,
                    i = e || {},
                    r = [];
                if (
                    ((a = a || this.options),
                    (e = t.extend(!0, {}, a, e)),
                    i.hasOwnProperty("wrapper") && i.wrapper.hasOwnProperty("inheritStyles") && (e.wrapper.inheritStyles = i.wrapper.inheritStyles),
                    e.enable &&
                        ("toggle" === e.show ? (e.show = this.isType("hidden", e.states)) : "infer" === e.show && (e.show = this.isType("shown", e.states)),
                        "infer" === e.toggle.position && (e.toggle.position = "rtl" === this.element.css("text-direction") ? "left" : "right"),
                        !t.isArray(e.toggle.attachToKeyCodes)))
                ) {
                    if (!0 === e.toggle.attachToKeyCodes)
                        switch ((n = t(e.toggle.element)).prop("tagName").toLowerCase()) {
                            case "button":
                            case "input":
                                break;
                            case "a":
                                if (n.filter("[href]").length) {
                                    r.push(32);
                                    break;
                                }
                            default:
                                r.push(32, 13);
                        }
                    e.toggle.attachToKeyCodes = r;
                }
                return e;
            },
            updateElement: function () {
                return !(!this.options.enable || this.isType() || (this.element.prop(t.extend({}, this.options.props, this.state().props)).addClass(this.state().className).removeClass(this.otherState().className), this.updateToggle(), 0));
            },
            isType: function (t, a) {
                return (a = a || this.options.states)[(t = t || this.state(e, e, a).props.type)] && (t = a[t].props.type), this.element.prop("type") === t;
            },
            state: function (t, a, n) {
                return (n = n || this.options.states), "boolean" == typeof (t = t === e ? this.options.show : t) && (t = t ? "shown" : "hidden"), n[(t = a ? ("shown" === t ? "hidden" : "shown") : t)];
            },
            otherState: function (t) {
                return this.state(t, !0);
            },
            wrapElement: function (e) {
                var a,
                    n = e.enforceWidth;
                return (
                    this.wrapperElement.length ||
                        ((a = this.element.outerWidth()),
                        t.each(
                            e.inheritStyles,
                            t.proxy(function (t, a) {
                                e.styles[a] = this.element.css(a);
                            }, this)
                        ),
                        this.element.css(e.innerElementStyles).wrap(t(e.element).addClass(e.className).css(e.styles)),
                        (this.wrapperElement = this.element.parent()),
                        !1 !== (n = !0 === n ? this.wrapperElement.outerWidth() !== a && a : n) && this.wrapperElement.css("width", n)),
                    this.wrapperElement
                );
            },
            initToggle: function (e) {
                return (
                    this.toggleElement.length ||
                        ((this.toggleElement = t(e.element).attr(e.attr).addClass(e.className).css(e.styles).appendTo(this.wrapperElement)),
                        this.updateToggle(),
                        this.positionToggle(e.position, e.verticalAlign, e.offset),
                        e.touchSupport ? (this.toggleElement.css(e.touchStyles), this.element.on(e.attachToTouchEvent, t.proxy(this.toggleTouchEvent, this))) : this.toggleElement.on(e.attachToEvent, t.proxy(this.toggleEvent, this)),
                        e.attachToKeyCodes.length && this.toggleElement.on(e.attachToKeyEvent, t.proxy(this.toggleKeyEvent, this))),
                    this.toggleElement
                );
            },
            positionToggle: function (t, e, a) {
                var n = {};
                switch (((n[t] = a), e)) {
                    case "top":
                    case "bottom":
                        n[e] = a;
                        break;
                    case "middle":
                        (n.top = "50%"), (n.marginTop = -(this.toggleElement.outerHeight() / 2));
                }
                return this.toggleElement.css(n);
            },
            updateToggle: function (t, e) {
                var a;
                return (
                    this.toggleElement.length &&
                        ((a = "padding-" + this.options.toggle.position),
                        (t = t || this.state().toggle),
                        (e = e || this.otherState().toggle),
                        this.toggleElement.attr(t.attr).addClass(t.className).removeClass(e.className).html(t.content),
                        (t = this.toggleElement.outerWidth() + 2 * this.options.toggle.offset),
                        this.element.css(a) !== t && this.element.css(a, t)),
                    this.toggleElement
                );
            },
            toggleEvent: function (t) {
                t.preventDefault(), this.toggle();
            },
            toggleKeyEvent: function (e) {
                t.each(
                    this.options.toggle.attachToKeyCodes,
                    t.proxy(function (t, a) {
                        if (e.which === a) return this.toggleEvent(e), !1;
                    }, this)
                );
            },
            toggleTouchEvent: function (t) {
                var e,
                    a,
                    n = this.toggleElement.offset().left;
                n && ((a = t.pageX || t.originalEvent.pageX), (a = "left" === this.options.toggle.position ? ((e = a), (n += this.toggleElement.outerWidth())) : ((e = n), a)), e <= a && this.toggleEvent(t));
            },
        }),
            (t.fn.hideShowPassword = function () {
                var e = {};
                return (
                    t.each(arguments, function (a, i) {
                        var r = {};
                        if ("object" == typeof i) r = i;
                        else {
                            if (!n[a]) return !1;
                            r[n[a]] = i;
                        }
                        t.extend(!0, e, r);
                    }),
                    this.each(function () {
                        var n = t(this),
                            i = n.data(a);
                        i ? i.update(e) : n.data(a, new r(this, e));
                    })
                );
            }),
            t.each({ show: !0, hide: !1, toggle: "toggle" }, function (e, a) {
                t.fn[e + "Password"] = function (t, e) {
                    return this.hideShowPassword(a, t, e);
                };
            });
    }),
    jQuery(document).ready(function (t) {
        jQuery().datepicker && t("input.wpas-date").length && "date" != t("input.wpas-date:first").prop("type") && t("input.wpas-date").datepicker();
    }),
    (function (t) {
        "use strict";
        t(function () {
            var e, a, n;
            t(".wpas-modal-trigger").featherlight(),
                t("#wpas_form_registration").on("change", 'input[name="wpas_pwdshow[]"]', function (e) {
                    e.preventDefault(), t("#wpas_password").hideShowPassword(t(this).prop("checked"));
                }),
                "undefined" != typeof wpas &&
                    stringToBool(wpas.emailCheck) &&
                    t("#wpas_form_registration").length &&
                    ((e = t("#wpas_form_registration #wpas_email")),
                    (a = t('<div class="wpas-help-block" id="wpas_emailvalidation"></div>')).appendTo(t("#wpas_email_wrapper")).hide(),
                    e.on("change", function () {
                        e.addClass("wpas-form-control-loading"),
                            (n = { action: "email_validation", email: e.val() }),
                            t.post(wpas.ajaxurl, n, function (t) {
                                a.html(t).show(), e.removeClass("wpas-form-control-loading");
                            });
                    }),
                    a.on("click", "strong", function () {
                        e.val(t(this).html()), a.hide();
                    }));
        });
    })(jQuery),
    (function (t) {
        "use strict";
        t(function () {
            var e, a, n, i, r, o, s;
            "undefined" != typeof wpas &&
                t(".wpas-ticket-replies").length &&
                t(".wpas-pagi").length &&
                ((e = t(".wpas-ticket-replies tbody")),
                (a = t(".wpas-pagi")),
                (n = t(".wpas-pagi-loadmore")),
                (i = t(".wpas-replies-current")),
                (r = t(".wpas-replies-total")),
                (o = { action: "wpas_load_replies", ticket_id: wpas.ticket_id, ticket_replies_total: 0, ticket_replies_nonce: wpas.front_replies_nonce }),
                (s = t(".wpas-pagi-text").outerHeight()),
                t(".wpas-pagi-loader").css({ width: s, height: s }),
                n.on("click", function (s) {
                    s.preventDefault(),
                        (o.ticket_replies_total = e.find("tr.wpas-reply-single").length - 1),
                        a.addClass("wpas-pagi-loading"),
                        t.post(wpas.ajaxurl, o, function (o) {
                            (o = t.parseJSON(o)),
                                a.removeClass("wpas-pagi-loading"),
                                i.text(o.current),
                                r.text(o.total),
                                o.current == o.total && n.hide(),
                                t(o.html)
                                    .appendTo(e)
                                    .addClass("wpas-reply-single-added")
                                    .delay(900)
                                    .queue(function () {
                                        t(this).removeClass("wpas-reply-single-added").dequeue();
                                    });
                        });
                }));
        });
    })(jQuery),
    jQuery(document).ready(function (t) {
        jQuery().select2 && t("select.wpas-select2").length && t("select.wpas-select2").select2();
    }),
    (function (t) {
        "use strict";
        t(function () {
            t(".wpas-reply-content").length &&
                t(".wpas-reply-content").each(function (t, e) {
                    "undefined" != typeof wpas && stringToBool(wpas.useAutolinker) && (e.innerHTML = Autolinker.link(e.innerHTML));
                });
            var e = t("#wpas-new-reply"),
                a = t('textarea[name="wpas_user_reply"]'),
                n = t('input[name="wpas_close_ticket"]');
            e.on("change", n, function () {
                a.is(":visible") && a.prop("required", n.is(":checked"));
            }),
                "undefined" != typeof tinyMCE
                    ? t(".wpas-form").on("submit", function (e) {
                          var a = t('[type="submit"]', t(this)),
                              i = tinyMCE.activeEditor.getContent();
                          if (!(n.is(":checked") || ("" !== i && null !== i)))
                              return (
                                  t(tinyMCE.activeEditor.getBody()).css("background-color", "#ffeeee"), alert(wpas.translations.emptyEditor), t(tinyMCE.activeEditor.getBody()).css("background-color", ""), tinyMCE.activeEditor.focus(), !1
                              );
                          a.prop("disabled", !0).text(wpas.translations.onSubmit);
                      })
                    : t(".wpas-form").on("submit", function (e) {
                          var a = t('[type="submit"]', t(this)),
                              n = a.attr("data-onsubmit") ? a.attr("data-onsubmit") : wpas.translations.onSubmit;
                          a.prop("disabled", !0).text(n);
                      });
        });
    })(jQuery),
    (function (t) {
        "use strict";
        t(function () {
            var e,
                a,
                n,
                i = t("#wpas_ticketlist"),
                r = t("#wpas_ticketlist > tbody > tr"),
                o = r.length,
                s = t("#wpas_ticketlist_filters");
            !1 !== (i.length && 5 <= o && t.fn.footable && "undefined" != typeof wpas)
                ? ((e = t(".wpas-filter-status")),
                  i.footable(),
                  i.footable().on("footable_filtering", function (t) {
                      var a = e.find(":selected").val();
                      a && 0 < a.length && ((t.filter += t.filter && 0 < t.filter.length ? " " + a : a), (t.clear = !t.filter));
                  }),
                  (a = []),
                  (n = ""),
                  r.each(function (e, i) {
                      (i = t(i).find(".wpas-label-status").text()), -1 == a.indexOf(i) && (a.push(i), (n += '<option value="' + escapeHtml(i) + '">' + escapeHtml(i) + "</option>"));
                  }),
                  1 < a.length ? e.append(n) : e.hide(),
                  e.on("change", function (e) {
                      e.preventDefault(), i.trigger("footable_filter", { filter: t("#wpas_filter").val() });
                  }),
                  t(".wpas-clear-filter").on("click", function (t) {
                      t.preventDefault(), e.val(""), i.trigger("footable_clear_filter");
                  }))
                : s.hide();
        });
    })(jQuery),
    (function (t) {
        "use strict";
        t(function () {
            var e;
            "undefined" != typeof wpas &&
                wpas.fileUploadMax &&
                (e = t("#wpas_files")).on("change", function (a) {
                    a.preventDefault();
                    var n = [];
                    t.each(e.get(0).files, function (t, e) {
                        e.size > wpas.fileUploadSize && n.push(e.name);
                    }),
                        0 !== n.length && (alert(wpas.fileUploadMaxSizeError[0] + "\n\n" + n.join("\n") + ".\n\n" + wpas.fileUploadMaxSizeError[1]), clearFileInput(e[0])),
                        parseInt(e.get(0).files.length) > parseInt(wpas.fileUploadMax, 10) && (alert(wpas.fileUploadMaxError), clearFileInput(e[0]));
                }),
                t("body").on("click", ".btn_delete_attachment", function (e) {
                    e.preventDefault();
                    var a = t(this),
                        n = t('<span class="spinner" style="visibility: visible;margin-left: 0;float: left;margin-top: 0;"></span>');
                    n.insertAfter(a), a.hide();
                    var i = t(this).data("parent_id");
                    (e = t(this).data("att_id")),
                        t.post(wpas.ajaxurl, { action: "wpas_delete_attachment", parent_id: i, att_id: e, att_delete_nonce: wpas.front_delete_att_nonce }, function (t) {
                            a.show(), n.remove(), t.success && a.closest("li").html(t.data.msg);
                        });
                }),
                t("#wpas-new-reply .wpas-auto-delete-attachments-container input[type=checkbox]").on("change", function () {
                    var e = t(this),
                        a = t('<span class="spinner" style="visibility: visible;margin-left: 0;float: left;margin-top: 0;"></span>');
                    a.insertAfter(e), e.hide();
                    var n = { action: "wpas_auto_delete_attachment_flag", ticket_id: wpas.ticket_id, auto_delete: e.is(":checked") ? "1" : "0" };
                    t.post(wpas.ajaxurl, n, function (t) {
                        e.show(), a.remove();
                    });
                });
        });
    })(jQuery),
    (function (t) {
        t(function () {
            function e(e) {
                e.removeClass("is-expanded").addClass("is-collapsed"), t(".card").not(e).removeClass("is-inactive"), e.trigger("card_collapsed");
            }
            (Window.close_card = e),
                t("body").on("click", ".wpas_cards .card .js-expander", function () {
                    var a = t(this).closest(".card"),
                        n = t(".card");
                    a.hasClass("is-collapsed")
                        ? (n.not(a).removeClass("is-expanded").addClass("is-collapsed").addClass("is-inactive"),
                          a.removeClass("is-collapsed").addClass("is-expanded"),
                          a.trigger("card_expanded"),
                          n.not(a).hasClass("is-inactive") || n.not(a).addClass("is-inactive"))
                        : e(a);
                }),
                t("body").on("click", ".card_expanded_inner .btn-close", function () {
                    e(t(this).closest(".card"));
                });
        });
    })(jQuery);
