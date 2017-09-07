Array.prototype.shuffle = function() {
  for (let i = this.length; i > 0; --i)
  {
    let j = Math.floor(Math.random() * i);
    let x = this[i - 1];
    this[i - 1] = this[j];
    this[j] = x;
  }
}

const ANIM_DURATION = 500;

const quizzState = {
  quizz: null,
  nanswers : 0
}

const doneMsgs = [
  "Bien joué :)", "Pas mal !", "Bonne réponse :D"
]

function getQuizz(el)
{
  let quizzId = /^A([1-9]\d*)<br>/.exec($(this).children("h2").html())[1];
  quizzState.quizz = quizzs[parseInt(quizzId) - 1];
  $("div#winmsg").fadeOut(ANIM_DURATION);
  quizzState.nanswers = 0;

  var generated = '<div class="row">';

  quizzState.quizz.forEach(function(question, index) {
    generated += '<div class="col-md-6">\
                    <h2 class="sc-title">\
                      Question ' + (index + 1) + '<br>\
                      ' + question["question"] + '\
                    </h2>\
                    <ul class="list-group">';

    let choices = question["choices"];
    var genchoices = [];
    question["choices"].forEach(function(choice, index) {
      genchoices.push('<li class="list-group-item">\
                        ' + choice + '\
                      </li>');
    });
    genchoices.shuffle();

    generated += '    ' + genchoices.join('') + '\
                    </ul>\
                  </div>';
  });

  generated += '</div>';

  $("div#validate, div#scroll").fadeOut(ANIM_DURATION);
  $("div#quizz h1.sc-title").html($(this).children("h2").html());
  $("div#quizz div#questions").html(generated);
  $("div#quizz div#questions ul li").click(clickChoice);
  $("div#quizz").fadeIn(ANIM_DURATION);
  $("html, body").animate({
    scrollTop: $("div#quizz").offset().top
  }, ANIM_DURATION);
}

function getQuestion(div)
{
  let match = /^\s*Question ([1-9]\d*)<br>/.exec($(div).children("h2").html());
  if (!match)
  {
    console.error("wat");
    return null;
  }
  let index = parseInt(match[1]);
  if (index > quizzState.quizz.length)
  {
    console.log("uh");
    return null;
  }
  return quizzState.quizz[index - 1];
}

function setActive(choice, isActive)
{
  $(choice)
    .attr("class", "list-group-item");
  if (isActive)
    $(choice).addClass("active");
}

function clickChoice()
{
  let isActive = ($(this).hasClass("active") || $(this).hasClass("list-group-item-danger"));
  $(this).parent().children("li.list-group-item-danger").each(function() {
    setActive(this, false);
  });
  if (isActive)
  {
    setActive(this, false);
    return;
  }

  if ($(this).parent().children("li.active").length == 0)
    ++quizzState.nanswers;
  if (quizzState.nanswers === quizzState.quizz.length)
    $("div#validate").fadeIn(ANIM_DURATION);

  setActive(this, true);
}

function validateQuizz(event)
{
  event.stopPropagation();

  $("div#quizz div#questions div.col-md-6").each(function() {
    var $this = $(this);
    var question = getQuestion($this);
    if (question === null)
    {
      console.log("wth");
      return;
    }
    if ($this.find("div.alert-info").length === 1)
      return;
    var hasErrors = ($this.find("ul li.list-group-item-danger").length !== 0);

    $this.find("ul li.active").each(function() {
      setActive(this, false);

      var isCorrect = false;
      for (let i = 0; i < question.answers && !isCorrect; ++i)
      {
        if ($(this).html().indexOf(question.choices[i]) != -1)
          isCorrect = true;
      }
      let state = null;
      if (isCorrect)
      {
        state = "success";
        $(this).unbind("click");
      }
      else
      {
        state = "danger";
        hasErrors = true;
      }
      $(this).addClass("list-group-item-" + state);
    });

    if (!hasErrors &&
        $this.find("ul li.list-group-item-success").length === question.answers)
    {
      let explanation =
        question["explanation"] ||
        doneMsgs[Math.floor(Math.random() * doneMsgs.length)];
      if (explanation !== null)
      {
        $("<div class='alert alert-info'>")
          .text(explanation)
          .insertBefore($this.find("ul"));
      }
      $this.find("ul li").unbind("click");
    }
  });

  if ($("div#questions div.col-md-6 div.alert-info").length === quizzState.quizz.length)
  {
    $("div#scroll").fadeIn(ANIM_DURATION);
    $("div#validate").fadeOut(ANIM_DURATION);
  }
}

function scrollTop()
{
  $("html, body").animate({
    scrollTop: $("div#quizzs div.row").offset().top
  }, ANIM_DURATION);
  $("div#scroll").fadeOut(ANIM_DURATION, function() {
    $("div#quizz").fadeOut(ANIM_DURATION);
  });
}

$(function() {
  $("div.choice").click(getQuizz);
  $("div#validate button").click(validateQuizz);
  $("div#scroll button").click(scrollTop);
});
