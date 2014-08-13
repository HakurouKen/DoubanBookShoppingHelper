<div id="douban_info">
	<span class="rate">
		<span style="color:#666;">|</span>
		<span class="title">豆瓣评价：</span>
		<span class="content">
			<span class="star" style="background-position:0 <%=(-14)*(10-Math.floor(parseFloat(rating.average)+0.8))%>px"></span>
			<span class="score"><%=rating.average%></span>
			<span class="raters">
				<% if (rating.numRaters == 0){%>
					(没有人评价这本书)
				<%} else if (rating.numRaters < 10){%>
					(少于10人评价这本书)
				<%} else if (rating.numRaters >= 10){%>
					(共有
						<a href="http://book.douban.com/subject/<%=id%>/reviews" target="_blank"><%=rating.numRaters%></a>
					人评价)
				<%} else{%>
				<%}%>
			</span>
			<a href="http://book.douban.com/subject/<%=id%>" target="_blank">去豆瓣看这本书</a>
		</span>
	</span>
</div>