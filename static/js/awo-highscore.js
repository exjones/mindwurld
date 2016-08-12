var WurldScores = {

  calculate: function(){

    var obj = {
      player_name: WURLD_SETTINGS.skin_name.replace(/_/,' '),
      pigs_saved: WURLD.pigs_freed,
      treasure_found: WURLD.treasure_found,
      time_remaining: WURLD.remaining_time,
      total_score:
        (WURLD.pigs_freed * WURLD_SETTINGS.scores.pig_multiplier) +
        (WURLD.treasure_found * WURLD_SETTINGS.scores.treasure_multiplier) +
        (WURLD.remaining_time * WURLD_SETTINGS.scores.time_multiplier),
      time_stamp: (new Date()).getTime()
    };

    return obj;
  },

  save: function(obj){
    if(obj.total_score > 0){
      $.ajax({
        url: '/SCORE',
        method:'POST',
        data: JSON.stringify(obj),
        success:function(data){
          WurldScores.display();
        },
        dataType:'json',
        contentType: 'application/json',
        processData:false
      });
    }
    else WurldScores.display();
  },

  display: function(){

    $.ajax({
      url: '/SCORES',
      method:'GET',
      success:function(data){
        for(var h = 0;h < data.length;h++){
          var html = '<tr class="w-score">'+
					  '<td class="w-name">{name}</td>'+
					  '<td class="w-pigs">{pigs}</td>'+
					  '<td class="w-treasure">{treasure}</td>'+
					  '<td class="w-total">{total}</td>'+
				  '</tr>';

          html = html.replace(/{name}/,data[h].player_name);
          html = html.replace(/{pigs}/,data[h].pigs_saved);
          html = html.replace(/{treasure}/,data[h].treasure_found);
          html = html.replace(/{total}/,data[h].total_score);

          $('table.w-score-columns').append(html);
        }
        $('#w-highscore').fadeIn();
        $('#w-score-restart').click(function(){window.location.reload();});
      }
    });
  }
};
